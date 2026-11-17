# Comparativa Starter vs Medium

Cada paso del curso se puede pedir a la IA en varios niveles. Aquí se comparan **Starter** (una frase, como se lo pedirías a un amigo) y **Medium** (el comportamiento, sin decir cómo). La rama `main` tiene un nivel de cada paso, y las ramas `starter-NN` / `medium-NN` tienen el nivel que faltaba.

## Dónde está cada versión

| Paso | En `main` | En una rama |
|---|---|---|
| 01 | Starter (`step 01: starter`) y Medium (`step 01: medium react vite`) | – |
| 02 | Medium (`659bba9`) | `starter-02` |
| 03 | Medium (`5d894a8`) | `starter-03` |
| 04 | Medium (`6943068`) | `starter-04` |
| 05 | Medium (`6062885`) | `starter-05` |
| 06 | Starter (`d223317`) | `medium-06` |
| 07 | Medium (`588da6d`) | `starter-07` |
| 08 | Starter (`14bcfdb`) y Medium (`cb1ad38`) | – |
| 09 | Starter (`1d8a4c3`) y Medium (`step 09: medium`) | – |
| 10 | Starter (`092c5e4`) y Medium (`a897a72`) | – |

Para ver una rama: `git switch starter-02`. Para comparar con `main`: `git diff <commit de main> starter-02 --stat`.

## Qué salió al comparar (pasos 02 a 07)

| Paso | Starter frente a Medium |
|---|---|
| 02 | Casi igual. El Starter no hizo la zona de resultados. |
| 03 | Casi igual. El Starter conserva el aviso inicial y sus tests son menos exigentes. |
| 04 | Código idéntico. No hubo fase en rojo (primero código, después tests). |
| 05 | El Starter es más simple y más frágil por dentro: solo comprueba `response.ok`, sin tests del cliente. Se adelantó con el debounce, cambió el término de búsqueda y borró el filtro. |
| 06 | Misma funcionalidad. El Medium perdió el test de vaciar la caja y espera 400 ms al vaciarla. |
| 07 | El Starter hizo solo constantes: sin instancia única, sin congelar, sin test de identidad, y además tocó el `index.html`. |

## Conclusiones

- El Starter casi siempre entrega lo visible. Lo que se pierde está por dentro: tests, defensas y garantías.
- El Medium lo cubre cuando se nombra. Lo que no se nombra (la caja vacía en el paso 06) queda a criterio de la IA y puede perderse.
- Un pedido vago deja decisiones sin tomar: el número de milisegundos del debounce, qué pasa sin resultados, si se escriben tests.

## Cómo leer esta comparación

- En los pasos 02 a 04 el Starter se hizo en la misma sesión de Claude Code que el Medium, así que pudo recordar lo escrito antes. El código idéntico del paso 04 probablemente viene de ahí.
- Los pasos 05, 06 y 07 se hicieron en sesiones nuevas, así que esas comparaciones son más limpias.
- Los Starter no se compararon contra la captura del curso, sino por lo que decidió la IA por su cuenta.
