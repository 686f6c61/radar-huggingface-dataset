# xf3s/looped-lens-xf3s

## Resumen

Looped Lens, del equipo XF3S, es un conjunto de pesos de interpretabilidad presentado a la Looped Lens Challenge organizada por NDIF. No es un modelo de lenguaje generativo, sino una *lens* (instrumento de lectura) diseñada para inspeccionar el estado interno del modelo Inkling 2 Mini de Thinking Machines justo en el token anterior a su respuesta. El artefacto permite leer las representaciones ocultas del modelo para predecir el token de respuesta antes de que este lo emita.

El repositorio contiene dos ficheros: `lens46.safetensors`, una lens afín de bajo rango (rango 8) que actúa sobre la visita 46 (capa 22) del modelo objetivo, y `gate.safetensors`, una sonda lineal que clasifica si la pregunta requiere cómputo (aritmética, calendario, letras) o recuperación de memoria. La lens se aplica selectivamente solo cuando la sonda supera su umbral y el token principal predicho es un número, un día, un mes o una letra suelta.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación en interpretabilidad mecánica, no de un modelo desplegable para tareas de generación. Su valor reside en demostrar que es posible entrenar sondas ligeras que lean el estado residual de un transformer con una precisión útil en familias de preguntas computacionales, y en la metodología de validación empleada (estados desemparejados, pesos leídos como palabras, familias no vistas). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lens afín de bajo rango (rango 8) sobre estado residual de un transformer; sonda lineal binaria |
| Parametros totales | No disponible (los tensores son `U`, `V` de 2304 x 8 y `c` de 2304 para la lens; `probe_w` de 2304 y `probe_b` para la sonda) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente fp32 o fp16; no se especifica) |
| Idiomas soportados | No disponible (el modelo objetivo es Inkling 2 Mini; el artefacto no declara idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (`lens46.safetensors`, `gate.safetensors`) |

## Arquitectura y entrenamiento

La lens es una transformación afín de bajo rango aplicada sobre el estado residual que entra en la visita 46 (capa 22) del modelo Inkling 2 Mini, en la posición de lectura. La operación es `y = x + (x @ V) @ U.T + c`, donde `U` y `V` son matrices de 2304 x 8 y `c` es un vector de 2304. Tras la transformación se aplica la normalización final y el *unembedding* propios del modelo objetivo, de modo que la lens produce una distribución sobre el vocabulario. La sonda (`gate.safetensors`) es un clasificador lineal sobre el mismo estado normalizado a RMS unitaria, con pesos `probe_w` (2304), sesgo `probe_b` y un `threshold` que determina si la pregunta es de cómputo o de recuperación.

El entrenamiento se realizó sobre aproximadamente 3.000 preguntas en 30 familias, escritas por el equipo: aritmética, letras, días y meses, capitales, monumentos, deportistas, músicos, colores y otras. Cada pregunta se formateó en el formato de chat del modelo y se leyó en el token `<|message_model|>`. Se excluyeron las seis entidades nombradas del conjunto de práctica del reto. La lens se entrenó con rango 8 durante 20 épocas para colocar las grafías de la respuesta verdadera en la parte superior de la distribución; posteriormente se entrenó la sonda con etiquetas de cómputo frente a recuperación. En inferencia se leen diez visitas de logit-lens simples ([12, 24, 34, 35, 36, 43, 44, 45, 46, 47]) en la posición de lectura, y solo se sustituyen por la lens entrenada cuando la sonda supera el umbral y el token principal de la lens es un número, un día, un mes o una letra suelta.

## Capacidades

- Lectura del estado residual del modelo Inkling 2 Mini en la visita 46 (capa 22) mediante una transformación afín de bajo rango.
- Predicción del token de respuesta antes de que el modelo lo emita, aplicando normalización final y unembedding del propio modelo.
- Clasificación binaria de preguntas en computacionales (aritmética, calendario, letras) frente a de recuperación, mediante sonda lineal.
- Selección condicional de la lens: solo se activa cuando la sonda supera el umbral y la predicción es un número, día, mes o letra.
- Lectura en diez posiciones de visita del modelo, con una lens por visita y una sola posición de lectura.
- No utiliza el texto del prompt para la predicción; opera únicamente sobre estados internos.

## Casos de uso

- Investigación en interpretabilidad mecánica: permite estudiar cómo representa el modelo Inkling 2 Mini operaciones aritméticas y de calendario en capas intermedias, comparando la lectura de la lens con la salida real del modelo.
- Auditoría de sesgos de cómputo: la sonda permite separar preguntas que requieren cálculo de las que dependen de recuperación de memoria, útil para analizar en qué tipo de tareas el modelo falla o acierta.
- Validación de metodologías de logit-lens: sirve como referencia reproducible para equipos que quieran replicar el pipeline de entrenamiento de lenses de bajo rango sobre modelos abiertos.
- Detección temprana de respuestas erróneas: si la lens predice un token distinto al que emite el modelo, puede señalarse una posible inconsistencia interna antes de la generación completa.
- Docencia en cursos de interpretabilidad: el artefacto y su model card documentan un flujo completo de entrenamiento, validación y control de sesgos (estados desemparejados, familias no vistas).
- Experimentación con sondas lineales: el fichero `gate.safetensors` puede reutilizarse como ejemplo de clasificador ligero sobre estados normalizados en otros modelos con dimensión 2304.
- Reproducción del reto Looped Lens: el equipo XF3S publica los pesos para que otros participantes puedan comparar sus propias lenses contra esta entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card reporta únicamente comprobaciones cualitativas y de control: la lens sobre un estado promedio acierta el 4 % de las preguntas retenidas; con estados desemparejados de la misma familia cae al azar; y en familias no vistas la lens ayuda en preguntas computacionales y perjudica en las de recuperación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los tensores son pequeños (matrices de 2304 x 8 y vectores de 2304), pero la inferencia requiere cargar el modelo Inkling 2 Mini completo para obtener los estados residuales.
- GPU recomendadas: no disponible. Depende enteramente del modelo objetivo sobre el que se aplica la lens.
- ¿Cabe en GPU de consumo? No disponible; el cuello de botella es el modelo base, no la lens.
- Opciones de despliegue: el código del reto carga los ficheros mediante `lenses.fetch`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Looped Lens (XF3S) | Lens de interpretabilidad | No disponible (tensores pequeños) | No aplica | MIT | Hugging Face |
| Otras entradas del Looped Lens Challenge | Lens de interpretabilidad | No disponible | No aplica | No disponible | No disponible |
| Logit-lens estándar | Técnica de lectura | No aplica | No aplica | No aplica | Implementaciones abiertas |

No se dispone de datos de rendimiento comparables entre entradas del reto en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse para texto, código, matemáticas ni diálogo por sí solo; requiere el modelo Inkling 2 Mini como sustrato.
- La lens solo se ha entrenado y validado sobre unas 3.000 preguntas en 30 familias concretas; su comportamiento fuera de esas familias no está garantizado.
- En familias no vistas, la lens ayuda en preguntas computacionales pero perjudica en las de recuperación, según la propia model card; de ahí la dependencia de la sonda y de la regla de vocabulario.
- La sonda puede clasificar erróneamente preguntas mixtas o ambiguas, activando la lens donde no conviene.
- No se declaran idiomas soportados; las preguntas de entrenamiento parecen estar en inglés y en el formato de chat del modelo objetivo.
- Riesgo de sobreinterpretación: una predicción correcta de la lens no implica que el modelo "razone" de forma causal; la model card reporta controles, pero no un análisis causal exhaustivo.
- Licencia MIT permite uso comercial del artefacto, pero el uso del modelo base Inkling 2 Mini queda sujeto a su propia licencia, no incluida en esta información.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni de validación independiente.
- El tamaño del repo es 0.0 GB según la información de Hugging Face, lo que puede indicar que los pesos no están efectivamente alojados o que la métrica no se ha actualizado.

## Enlaces

- Hugging Face: https://huggingface.co/xf3s/looped-lens-xf3s
- Looped Lens Challenge (NDIF): https://ndif.us/looped-lens-challenge/
- Modelo objetivo Inkling 2 Mini: https://huggingface.co/thinkingmachines/Inkling-2-Mini
