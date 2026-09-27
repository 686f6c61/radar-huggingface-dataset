# SupersonicLabs/Julia-1-ONNX

## Resumen
Julia 1 ONNX (SupersonicLabs/Julia-1-ONNX) es una exportación a ONNX del modelo SupersonicLabs/Julia-1, publicada por el propio equipo Supersonic Labs, pensada para ejecutar inferencia en el navegador mediante WebGPU. No es un modelo generativo de texto: es un modelo de decisión que recibe un estado, una pregunta y entre 2 y 20 opciones de respuesta, y devuelve la opción seleccionada junto con probabilidades y logits sin procesar. La model card lo describe explícitamente como "decision model" y advierte de que elige entre respuestas suministradas, no genera texto libre.

El repositorio pesa 0,6 GB e incluye el grafo ONNX completo, 551 MB de pesos externos (model.onnx y model.onnx.data), el tokenizador de Julia 1 y un tokenizador empaquetado en Rust compilado a WebAssembly. La inferencia se apoya en ONNX Runtime WebGPU, que compila las operaciones del grafo a kernels WGSL, de modo que todo el cálculo permanece en el navegador si los archivos se sirven localmente. Se publica bajo licencia Apache 2.0.

Su relevancia actual está en que permite llevar un modelo de decisión a aplicaciones web sin backend ni GPU dedicada: cualquier navegador con soporte de WebGPU puede ejecutarlo. La model card reporta una paridad de salida de 100/100 predicciones respecto al modelo original, con una diferencia absoluta máxima de logits de 0,00225, y un tiempo medio de 75,47 ms por decisión en las pruebas del autor. Las cifras de precisión publicadas (73,15 % en decisiones tipadas, 94 % en un piloto con AG News y 86 % en un piloto con Emotion) proceden del runtime original y no se han vuelto a medir en WebGPU.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el repositorio incluye la etiqueta "multilingual", sin detalle de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model.onnx y model.onnx.data, 551 MB de pesos externos) |
| Tipo de modelo | Modelo de decisión (decision model), no generativo |
| Entrada | state, question y entre 2 y 20 opciones |
| Tipos de consulta | choice, score y noul (dos opciones en orden falso/verdadero) |
| Runtime de inferencia | ONNX Runtime WebGPU (kernels WGSL) |
| Tokenizador | Rust compilado a WebAssembly (incluye binding N-API para Node) |
| Tamaño del repositorio | 0,6 GB |
| Descargas | 0 |
| Likes | 21 |
| Fecha de creación | 2026-09-25 |
| Última actualización | 2026-09-25 |

## Arquitectura y entrenamiento
La información disponible no detalla la arquitectura interna del modelo base Julia 1 (tipo de red, número de capas, dimensión de embeddings o mecanismo de atención). Lo que sí se especifica es el proceso de exportación: el grafo de decisión original, implementado en PyTorch, y los pesos del checkpoint de Julia 1 se exportan a ONNX conservando la misma lógica de decisión. El script export.py incluido en el repositorio permite regenerar el grafo ONNX a partir del checkpoint original.

Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de ajuste como RLHF o DPO. El autor afirma que la calidad de decisión es efectivamente la misma que la del modelo original, con la salvedad de que el redondeo en coma flotante puede alterar una elección cuando los logits de dos opciones están casi empatados. La innovación técnica destacable de este repositorio no está en el modelo en sí, sino en el canal de despliegue: compilación del grafo ONNX a kernels WGSL mediante ONNX Runtime WebGPU y tokenización en Rust/WebAssembly, con una sesión que se descarga y se calienta una sola vez y se reutiliza en decisiones posteriores.

## Capacidades
- Decisión entre opciones: dado un estado y una pregunta, puntúa y ordena entre 2 y 20 opciones, devolviendo el índice seleccionado, las probabilidades de visualización y los logits sin procesar.
- Tres modos de consulta: "choice" para selección de una opción, "score" para puntuación de opciones y "noul" para decisión binaria con exactamente dos opciones en orden falso/verdadero.
- Ejecución íntegra en el navegador: no requiere backend ni envío de datos a un servidor si los archivos se sirven localmente.
- Reutilización de sesión: la API load(baseUrl) descarga y calienta el modelo una vez; las decisiones siguientes reutilizan la misma sesión en memoria.
- Codificación estricta activada por defecto en el tokenizador.
- Capacidad multilingüe declarada mediante etiqueta del repositorio, sin especificación de idiomas concretos.
- No dispone de generación de texto, tool calling, función de agente ni razonamiento multi-paso, ya que no es un modelo generativo.

## Casos de uso
- Enrutado de tickets de soporte: usar el estado con la descripción del ticket y la pregunta "¿qué equipo debe gestionarlo?", con la lista de equipos como opciones y tipo "choice". La model card usa exactamente este ejemplo (soporte de cuenta frente a facturación).
- Clasificación de noticias: el piloto con AG News reportado por el autor alcanzó un 94 %; el modelo puede categorizar titulares o resúmenes eligiendo entre un conjunto fijo de categorías editoriales.
- Análisis de sentimiento o detección de emociones: el piloto con Emotion reportó un 86 %, útil para etiquetar opiniones o comentarios con una taxonomía cerrada de emociones.
- Filtrado binario de contenido: con el tipo "noul" y dos opciones en orden falso/verdadero se puede implementar una comprobación booleana (por ejemplo, decidir si un texto requiere revisión humana).
- Ranking de opciones en formularios o asistentes web: con el tipo "score" el modelo puntúa alternativas y permite ordenarlas, integrándose en asistentes interactivos que se ejecutan en el propio navegador.
- Aplicaciones con requisitos de privacidad: al ejecutarse íntegramente en el cliente, resulta apto para clasificar datos sensibles (texto médico, financiero o de RR. HH.) sin que el contenido salga del dispositivo del usuario.
- Etiquetado asistido en pipelines de anotación: las probabilidades y los logits devueltos permiten preetiquetar y priorizar elementos por confianza antes de la revisión humana.
- Ayudas a la decisión embebidas en páginas web: la interfaz de playground y la API de la librería permiten integrar decisiones guiadas en páginas que aparecen de inmediato y solo cargan el modelo cuando el usuario pulsa un botón.

## Benchmarks y rendimiento

| Prueba | Resultado | Entorno |
|---|---|---|
| Decisiones tipadas (typed decisions) | 73,15 % | Runtime original de Julia 1 (no reejecutado en WebGPU) |
| AG News (piloto) | 94 % | Runtime original de Julia 1 (no reejecutado en WebGPU) |
| Emotion (piloto) | 86 % | Runtime original de Julia 1 (no reejecutado en WebGPU) |
| Tiempo mediano para 100 decisiones | 7,55 s | WebGPU, Brave en Linux, lotes de cuatro, cinco ejecuciones tras calentamiento |
| Tiempo mediano por decisión | 75,47 ms | WebGPU |
| Predicciones coincidentes con Julia 1 original | 100 / 100 | WebGPU |
| Diferencia absoluta máxima de logits | 0,00225 | WebGPU |
| Carga y calentamiento con caché local del navegador | 5,84 s | WebGPU |
| Referencia de Julia 1 en CPU, mismas 100 peticiones | 18,23 s | Python CPU (no es un modo CPU de esta librería) |

El autor advierte de que la comparación entre WebGPU y CPU no constituye una afirmación controlada de aceleración por hardware, ya que los tiempos de ejecución de ambos entornos difieren en su sobrecarga, y de que no disponía de una comparación en CUDA. La suite de precisión original no se ha vuelto a ejecutar en WebGPU: la comprobación de 100 predicciones coincidentes mide paridad de salida sobre ese conjunto de peticiones, no una nueva cifra de precisión.

## Requisitos de hardware
- Pesos y tamaño: 551 MB de pesos externos y un repositorio de 0,6 GB; los archivos model.onnx y model.onnx.data deben permanecer juntos.
- VRAM: no se publica una cifra explícita. La model card indica que los límites de GPU del navegador varían y que el dispositivo necesita memoria suficiente (el texto disponible se corta en ese punto).
- GPU compatible: cualquier GPU con soporte de WebGPU en el navegador. La prueba de referencia del autor se ejecutó en Brave sobre Linux; no se especifica el modelo de GPU empleado.
- GPU de consumo: al no publicarse requisitos de VRAM, no se puede confirmar qué tarjetas concretas son suficientes; el requisito funcional es que el navegador exponga WebGPU.
- Opciones de despliegue: ONNX Runtime WebGPU en el navegador a través de la librería index.js; binding N-API de Node (código fuente en rust/) para aplicaciones que quieran codificación nativa residente; el runtime Python CPU o CUDA pertenece al repositorio original SupersonicLabs/Julia-1, no a este.
- Latencia: 75,47 ms por decisión en mediana con lotes de cuatro, y 7,55 s para 100 decisiones en el benchmark del autor.
- Arranque: 5,84 s de descarga y calentamiento con caché local del navegador; la API está diseñada para iniciar la descarga desde un clic del usuario y reutilizar después la sesión.
- Throughput: no se publica una métrica de throughput; al no ser un modelo generativo, no aplica la medida en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Entorno de inferencia | Pesos | Paridad con el original | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SupersonicLabs/Julia-1-ONNX (este repositorio) | Navegador WebGPU (ONNX Runtime, kernels WGSL) | Mismos pesos que Julia 1 exportados a ONNX | 100/100 predicciones, diferencia máxima de logits de 0,00225 | Apache 2.0 | HuggingFace, con playground y benchmark incluidos |
| SupersonicLabs/Julia-1 (modelo base) | Python CPU o CUDA | Checkpoint original | Referencia de comparación | Apache 2.0 (según la licencia de este repositorio) | HuggingFace |

No se dispone de información sobre otros modelos de decisión comparables en la documentación proporcionada, por lo que la comparativa se limita al modelo base del que deriva esta exportación. Diferencias clave: el original usa el grafo de decisión en PyTorch, tokenizador de Python y modelo residente en Python, mientras que esta exportación usa el mismo grafo en ONNX, tokenizador Rust/WebAssembly y sesión residente en el navegador.

## Limitaciones y advertencias
- No es un modelo generativo de texto: elige entre respuestas suministradas y no puede redactar contenido libre.
- Cada llamada nativa acepta entre 2 y 20 opciones; fuera de ese rango no está soportado.
- Funciona mejor cuando el estado contiene la evidencia necesaria y las opciones son claramente distintas; con opciones ambiguas o información insuficiente la decisión será menos fiable.
- El redondeo en coma flotante puede cambiar la elección cuando dos logits compiten casi empatados, incluso con paridad global del 100 % en el conjunto de prueba.
- Las cifras de precisión (73,15 %, 94 % y 86 %) provienen del runtime original y no se han reejecutado en WebGPU; no deben presentarse como rendimiento medido de esta exportación.
- El benchmark de WebGPU procede de un único entorno (Brave sobre Linux) y no constituye una comparación controlada de hardware frente a CPU o CUDA.
- Los límites de memoria de la GPU dependen del navegador y del dispositivo; no se publica una cifra mínima de VRAM y el texto disponible de la model card queda truncado en ese punto.
- No hay información disponible sobre sesgos del modelo, comportamiento por idioma ni riesgos específicos de alucinación (al no ser generativo, el riesgo se traduce en seleccionar la opción incorrecta).
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales indicadas; no obstante, conviene verificar la licencia del modelo base Julia 1 antes de un despliegue en producción.
- El repositorio registra 0 descargas y 21 likes en el momento de la consulta, por lo que no hay evidencia de adopción en producción.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/SupersonicLabs/Julia-1-ONNX
- Modelo base (runtime Python CPU y CUDA): https://huggingface.co/SupersonicLabs/Julia-1
- Medidas completas del benchmark WebGPU: https://huggingface.co/SupersonicLabs/Julia-1-ONNX/blob/main/benchmark-webgpu.json
- Conjunto de 100 peticiones de prueba y logits del modelo original: https://huggingface.co/SupersonicLabs/Julia-1-ONNX/blob/main/parity-cases.json
- Página para repetir el benchmark en el navegador: https://huggingface.co/SupersonicLabs/Julia-1-ONNX/blob/main/benchmark-webgpu.html
- Interfaz de decisión (playground): https://huggingface.co/SupersonicLabs/Julia-1-ONNX/blob/main/playground.html
- Script de exportación a ONNX: https://huggingface.co/SupersonicLabs/Julia-1-ONNX/blob/main/export.py
