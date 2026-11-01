# tilnex/BFS-Best-Face-Swap

## Resumen

BFS (Best Face Swap) es una familia de adaptadores LoRA para modelos de edición de imagen por difusión, orientada específicamente a la sustitución de rostros y de cabezas completas con mezcla natural de tonos de piel e iluminación coherente. El autor, tilnex, publica el paquete en HuggingFace bajo licencia MIT y lo distribuye como una serie de variantes entrenadas sobre Qwen-Image-Edit 2509/2511 y sobre FLUX.2 Klein en sus versiones de 4B y 9B, tanto en precisión completa como en fp8.

El modelo no es un generador autónomo: es un conjunto de pesos LoRA que se aplican sobre un modelo base de edición image-to-image. Cada versión de la serie cubre un nivel distinto de reemplazo, desde el intercambio exclusivo de la cara preservando pelo y fondo del objetivo, hasta el trasplante completo de cabeza con alineación de pose y consistencia anatómica. La variante V5, entrenada durante más de 5.500 pasos sobre Qwen-Image-Edit 2511, se presenta como la recomendada para flujos de trabajo con ese modelo base.

Su relevancia actual radica en que estandariza un pipeline de face swap de alta fidelidad sobre modelos de edición abiertos y con licencia permisiva, algo que hasta hace poco requería soluciones propietarias o entrenamientos ad hoc. El repositorio ocupa 10,9 GB y agrupa todos los safetensors de la serie, lo que simplifica la descarga y el despliegue en ComfyUI o en pipelines de diffusers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores de bajo rango) sobre modelos de difusión image-to-image; base Qwen-Image-Edit 2509/2511 y FLUX.2 Klein 4B/9B |
| Parametros totales | No disponible (depende del modelo base; los LoRA se distribuyen con rangos 16, 32, 64 y 128 según variante) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | fp16 y fp32 en las variantes merged de Head V5; fp8 disponible en los modelos base FLUX.2 Klein; el resto de LoRA en safetensors de precisión nativa |
| Idiomas soportados | en (inglés) en prompts y documentación |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con diffusers y ComfyUI) |

## Arquitectura y entrenamiento

La serie BFS se compone de adaptadores LoRA de bajo rango que se acoplan a modelos de difusión transformer para edición de imagen. No se trata de un modelo entrenado desde cero, sino de un ajuste fino paramétricamente eficiente sobre Qwen-Image-Edit 2509/2511 y sobre FLUX.2 Klein 4B/9B. Las variantes de FLUX.2 Klein se distribuyen con rangos 64 y 128 y en pasos de entrenamiento distintos (3500 y 3750), lo que permite elegir entre un ajuste más conservador y otro más agresivo.

El entrenamiento se realizó sobre pares de imágenes de cuerpo y cara con instrucciones textuales específicas por versión, y la documentación indica que la variante V5 acumula más de 5.500 pasos sobre el modelo 2511. Una innovación destacable del pipeline es la inversión del orden de entrada a partir de la V3: se envía primero la imagen del cuerpo y después la de la cara, lo que el autor asocia a una mejor alineación de pose y a una mezcla más estable. Las versiones merged de V5 combinan los pesos de Head V4 (2509) con el original entrenado sobre 2511, y el autor señala que la versión merged reproduce un rango de expresiones más amplio.

## Capacidades

- Sustitución de rostro preservando pelo, iluminación y fondo de la imagen objetivo (Face V1).
- Trasplante completo de cabeza con mezcla natural entre cabeza, pelo y cuerpo del objetivo (Head V1 a V5).
- Transferencia de expresión facial y microexpresiones desde la imagen base hacia la identidad transferida (Head V4 y V5).
- Alineación de pose, rotación de cabeza y dirección de la mirada según la imagen de cuerpo.
- Coincidencia de tono de piel, sombras e iluminación entre la cabeza transferida y el cuerpo receptor.
- Conservación de identidad, rasgos faciales (ojos, nariz, boca) y textura de piel de la imagen de la cara.
- Integración con flujos de trabajo de ComfyUI y con la librería diffusers.
- Compatibilidad con prompts de instrucción en inglés para controlar el alcance del intercambio (solo cara o cabeza completa).
- No dispone de tool calling, razonamiento multi-paso ni capacidades de audio o vídeo.

## Casos de uso

- Producción audiovisual y previsualización de reparto: el LoRA permite generar pruebas de vestuario y caracterización sustituyendo la cabeza de un actor por la de otro sobre el cuerpo de la imagen base, manteniendo iluminación y encuadre del plató.
- Corrección de identidad en material generado: cuando un pipeline de generación produce un rostro inconsistente entre tomas, la variante Face V1 permite reemplazar solo la cara conservando pelo y fondo, lo que reduce el retoque manual.
- Anonimización controlada de material fotográfico: sustituir rostros por identidades sintéticas antes de publicar imágenes, preservando la composición original y el tono de piel del sujeto anonimizado.
- Creación de avatares y personajes consistentes: la serie Head V3/V5 permite trasplantar una identidad de referencia sobre cuerpos distintos manteniendo proporciones anatómicas, útil para generar un elenco coherente de personajes.
- Edición fotográfica profesional en estudio: el flujo con prompt de coincidencia de piel e iluminación (Head V1) sirve para integrar una cabeza capturada con luz distinta en una sesión ya rodada, ajustando sombras y tonos de forma automática.
- Pruebas de concepto en investigación sobre deepfakes y detección: disponer de un pipeline abierto y reproducible con licencia MIT facilita generar conjuntos de datos controlados para entrenar y evaluar detectores de manipulación facial.
- Personalización de contenido en marketing: adaptar campañas con la misma composición pero distintas identidades de modelo, reutilizando la imagen de cuerpo y sustituyendo solo la cabeza con la variante Head V5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa 10,9 GB, pero en inferencia solo se carga un LoRA junto con su modelo base.
- Qwen-Image-Edit 2511 y FLUX.2 Klein 9B requieren GPUs de gama alta; las variantes fp8 y los LoRA de rango 16 reducen el consumo de VRAM de forma significativa.
- FLUX.2 Klein 4B y sus variantes fp8 son las opciones más ligeras de la serie y las más plausibles para GPUs de consumo, aunque el autor no publica cifras de VRAM mínima.
- GPU recomendadas: no disponible de forma explícita; por el tamaño de los modelos base, se sitúan en el rango de A100, H100 y RTX 4090 para las variantes de 9B en fp16.
- Opciones de despliegue: diffusers (librería declarada), ComfyUI (flujos de trabajo publicados por el autor en Civitai) y cualquier runtime compatible con safetensors y LoRA.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Modelos base | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BFS Best Face Swap | LoRA de face/head swap | Qwen-Image-Edit 2509/2511, FLUX.2 Klein 4B/9B | No aplica | MIT | HuggingFace, ComfyUI, diffusers |
| Face V1 / Head V1 de la misma serie | LoRA especializados | Qwen-Image-Edit 2509 | No aplica | MIT | Incluidos en el mismo repo |
| Alternativas genéricas de face swap | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables de terceros en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo solo acepta instrucciones en inglés; los prompts en otros idiomas no están soportados oficialmente.
- El orden de entrada está invertido a partir de la V3 (cuerpo primero, cara después); usar el orden antiguo con estas variantes degrada el resultado.
- La documentación advierte de que la reproducción de expresiones aún no es perfecta en la V5, incluso en la versión merged que el autor considera superior.
- Riesgo de artefactos en la mezcla de piel, sombras y pelo cuando la iluminación entre cuerpo y cara es muy dispar.
- No se han publicado evaluaciones cuantitativas ni benchmarks; el rendimiento descrito es cualitativo y basado en la evaluación del autor.
- Uso dual: la sustitución de rostros puede emplearse para suplantación de identidad o desinformación; la licencia MIT no impone restricciones de uso, por lo que la responsabilidad ética y legal recae en el desplegador.
- El repositorio tiene un volumen de descargas bajo (106) y ninguna valoración, lo que limita la validación por parte de la comunidad.
- Los sesgos del modelo base (Qwen-Image-Edit o FLUX.2 Klein) se heredan; no se documentan sesgos específicos del LoRA.

## Enlaces

- HuggingFace: https://huggingface.co/tilnex/BFS-Best-Face-Swap
- Flujo de trabajo Head/Face Swap para Qwen Image Edit 2509 (Civitai): https://civitai.com/articles/20190/headface-swap-workflow-qwen-image-edit-2509
- Modelo base Qwen-Image-Edit 2511: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Modelo base FLUX.2 Klein 9B: https://huggingface.co/black-forest-labs/FLUX.2-klein-9B
- Modelo base FLUX.2 Klein 4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
