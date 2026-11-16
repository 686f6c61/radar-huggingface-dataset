# sramsingh-env/cw4-screenshot2html-v0.2

## Resumen

El modelo `sramsingh-env/cw4-screenshot2html-v0.2` es un adaptador LoRA de rango 16 sobre el modelo base Qwen3-VL-2B-Instruct, desarrollado por el usuario sramsingh-env como trabajo de curso (ECNG6102, CW4). Su función es convertir una captura de pantalla de una página web en un único archivo HTML estilizado con Tailwind CSS 2.2.19. No se trata de un modelo completo, sino de un conjunto de pesos de adaptación (0,9 GB en el repositorio) que requieren cargar primero el modelo base para poder utilizarse.

La relevancia del proyecto reside en que aborda una tarea concreta de "screenshot-to-code" mediante un ajuste fino eficiente (QLoRA en 4 bits) ejecutado en una sola NVIDIA RTX 4090 en 22 minutos, lo que demuestra que es posible obtener mejoras sustanciales frente a alternativas zero-shot con recursos muy limitados. El adaptador se entrenó sobre 8.000 páginas del dataset WebSight v0.2 y se evaluó tanto en páginas sintéticas retenidas como en el conjunto real Design2Code.

A pesar de sus buenos resultados en el conjunto sintético (puntuación compuesta de 0,896 frente a 0,345 del modelo base zero-shot), el propio autor advierte de limitaciones importantes: la longitud de salida está limitada a 1.024 tokens, solo el 45 % de las salidas en páginas reales están completas y el modelo está pensado como generador de primeros borradores, no para producción sin revisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=16, alpha=16, dropout 0) sobre transformer multimodal Qwen3-VL-2B-Instruct; capas de visión congeladas |
| Parámetros totales | No disponible (adaptador LoRA de rango 16; el modelo base Qwen3-VL-2B-Instruct tiene 2B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Secuencias de entrenamiento de hasta 2.048 tokens; salida limitada a 1.024 tokens nuevos |
| Tipos de cuantización | QLoRA 4-bit (bnb-4bit) para el entrenamiento; el adaptador se distribuye en safetensors |
| Idiomas soportados | No disponible |
| Licencia | CC-BY-4.0 (adaptador y resultados); modelo base Apache-2.0; datos con sus licencias originales |
| Formato de pesos | Safetensors (adaptadores PEFT/LoRA); repositorio de 0,9 GB |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-VL-2B-Instruct, un modelo multimodal de tipo image-text-to-text. El ajuste fino emplea QLoRA en 4 bits mediante la librería Unsloth, con un adaptador LoRA de rango 16 y alpha 16, sin dropout, aplicado únicamente a las capas de atención y MLP del modelo de lenguaje; las capas de visión permanecen congeladas. El entrenamiento usó 8.000 páginas de WebSight v0.2, una época, batch efectivo de 8, learning rate de 2e-4 con schedule coseno, optimizador AdamW de 8 bits e imágenes redimensionadas a 1.024 px de ancho. Todo el proceso se completó en 22 minutos en una única RTX 4090.

El checkpoint seleccionado corresponde al paso 664 de 1.000, y el repositorio incluye también el adaptador tras la época completa. No se menciona el uso de RLHF, DPO ni técnicas de decodificación especulativa. La innovación principal es de eficiencia: demostrar que un ajuste QLoRA de bajo coste sobre un modelo de 2B puede superar ampliamente a alternativas zero-shot y a un baseline de vecino más cercano con PCA en la tarea de generación de HTML a partir de capturas.

## Capacidades

- Generación de un archivo HTML completo a partir de una captura de pantalla de una página web.
- Estilizado con Tailwind CSS 2.2.19 en la salida generada.
- Procesamiento de imágenes redimensionadas a 1.024 px de ancho como entrada.
- Generación de texto condicionada por imagen (image-text-to-text) mediante el modelo base Qwen3-VL-2B-Instruct.
- Reproducción de estructura de etiquetas HTML, texto visible y paleta de colores de la página de referencia.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni capacidades multilingües específicas.

## Casos de uso

- Generación de primeros borradores de maquetación: un desarrollador sube una captura de una página y obtiene un archivo HTML con Tailwind que sirve como punto de partida para editar a mano, aprovechando la alta tasa de HTML completo (98 %) en páginas sintéticas.
- Prototipado rápido de interfaces: a partir de un mockup o captura de una web de referencia, el adaptador produce estructura y estilos base que aceleran la creación de prototipos en equipos pequeños.
- Evaluación académica y reproducibilidad: el repositorio incluye splits de datos, predicciones guardadas, puntuaciones, intervalos de confianza y figuras, lo que permite repetir la evaluación sin reentrenar, útil para cursos e investigación sobre screenshot-to-code.
- Aprendizaje y docencia: sirve como ejemplo práctico de QLoRA con Unsloth sobre un modelo multimodal de 2B, ejecutable en una sola GPU de consumo.
- Pruebas comparativas de pipelines de conversión: puede integrarse como baseline ajustado frente a modelos zero-shot en experimentos de generación de código a partir de imágenes.
- Generación de esqueletos de páginas para tareas de accesibilidad o revisión visual: el borrador HTML permite inspeccionar la estructura de etiquetas y el texto detectado antes de reescribir el código definitivo.
- No se recomienda para generación directa en producción ni para clonar diseños de terceros, según las propias indicaciones del autor.

## Benchmarks y rendimiento

Resultados publicados por el autor (100 páginas por conjunto de test; la puntuación compuesta es la media de similitud de texto visible, estructura de etiquetas HTML e histograma de color entre la página renderizada de referencia y la predicción):

| Modelo | Compuesto sintético | Compuesto real | HTML completo sintético |
|---|---|---|---|
| B0 página en blanco | 0,275 | 0,262 | n/a |
| B1 PCA + vecino más cercano | 0,627 | 0,401 | 100 % |
| B2 Qwen3-VL-2B zero-shot | 0,345 | 0,373 | 4 % |
| Este adaptador (paso 664) | 0,896 | 0,604 | 98 % |

Todas las mejoras frente a los baselines cuentan con intervalos de confianza bootstrap pareados del 95 % que excluyen el cero. "Sintético" se refiere a páginas WebSight retenidas de tipos de negocio no vistos en entrenamiento; "real" corresponde a páginas de Design2Code.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento QLoRA en 4 bits cupo en una RTX 4090, por lo que la inferencia con cuantización de 4 bits debería ser viable en GPUs de consumo con 8-16 GB.
- GPU recomendadas: NVIDIA RTX 4090 (usada para el entrenamiento); cualquier GPU con suficiente VRAM para el modelo base de 2B en 4 bits.
- Cabe en GPU de consumo: sí, según el hardware de entrenamiento documentado (RTX 4090).
- Opciones de despliegue: carga mediante Unsloth y PEFT; el adaptador se aplica sobre el modelo base. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles; el entrenamiento completo duró 22 minutos en una RTX 4090.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (compuesto sintético / real) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Qwen3-VL-2B) | 2B (base) + LoRA r=16 | 2.048 tokens de entrenamiento; salida 1.024 | 0,896 / 0,604 | CC-BY-4.0 (adaptador); Apache-2.0 (base) | Hugging Face |
| Qwen3-VL-2B-Instruct zero-shot | 2B | No disponible | 0,345 / 0,373 | Apache-2.0 | Hugging Face |
| B1 PCA + vecino más cercano | No aplica (baseline no neuronal) | No aplica | 0,627 / 0,401 | No disponible | Incluido en el repositorio |

No se dispone de datos de otros modelos comparables de screenshot-to-code en la información proporcionada.

## Limitaciones y advertencias

- Longitud limitada: entrenado con páginas sintéticas cortas; las páginas reales son unas 50 veces más largas y la salida se corta a 1.024 tokens, por lo que solo el 45 % de las salidas en páginas reales están completas.
- Fallos conocidos: se pierden secciones inferiores de la página (formularios, pies de página), se inventa texto cuando la captura tiene poco contenido y las maquetaciones se simplifican a los valores por defecto de Tailwind.
- Uso previsto restringido: pensado como primer borrador HTML para revisión humana, no para copiar el diseño de otra organización ni para desplegar código en producción sin revisión.
- Seguridad: las salidas deben renderizarse únicamente en un sandbox con scripts deshabilitados.
- Privacidad: el modelo copia el texto que lee en la captura, por lo que no deben subirse capturas con datos personales.
- Sesgos: no documentados explícitamente; al entrenarse sobre WebSight y Design2Code, puede heredar los sesgos de composición y estilo de esos datasets.
- Riesgo de alucinación: documentado en forma de invención de texto cuando la captura tiene poco contenido.
- Restricciones de licencia: el adaptador es CC-BY-4.0 y requiere atribución; los datos incluidos conservan sus licencias originales (WebSight CC-BY-4.0; Design2Code ODC-By).
- Idiomas: no disponibles en la información proporcionada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/sramsingh-env/cw4-screenshot2html-v0.2
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Paper WebSight: https://arxiv.org/abs/2403.09029
- Paper Design2Code: https://arxiv.org/abs/2403.03163
- Dataset WebSight: https://huggingface.co/datasets/HuggingFaceM4/WebSight
- Dataset Design2Code: https://huggingface.co/datasets/SALT-NLP/Design2Code-hf
