# TR4F/crackio-retouch

## Resumen

Crackio Retouch eyes es un adaptador LoRA de rango 32 construido sobre el modelo vision-lenguaje LiquidAI/LFM3-VL-2B de Liquid AI. Lo desarrolla TR4F, autor del editor de fotografía Crackio, y su función es convertir una imagen en un mapa estructurado de objetos: enumera las cosas separadas que aparecen (personas, animales, objetos, cielo, suelo) con una caja delimitadora para cada una, y, sobre un recorte cerrado, descompone un único objeto en sus partes (pelo, cara, cada prenda; ruedas, luces y puertas de un coche). El objetivo es habilitar la edición fotográfica por clic sobre elementos individuales ejecutada en la propia GPU del usuario, sin depender de servicios en la nube.

El adaptador no introduce una arquitectura nueva: es un LoRA aplicado sobre las capas de atención y MLP del modelo de lenguaje del LFM3-VL-2B, con rango 32 y alpha 32. Lo que aporta es el ajuste fino de la tarea de *grounding* y detección de objetos, con salida en JSON y cajas en coordenadas normalizadas de 0 a 1000. El resultado se consume de forma incremental: las cajas se emiten a medida que se generan, de modo que la primera aparece en menos de un segundo en una RTX 5090 y 23 objetos tardan unos 8 segundos.

Su relevancia es doble. Por un lado, demuestra que un modelo de 2B parámetros ajustado con LoRA puede aproximarse a un modelo mucho mayor (Qwen3-VL-8B-Instruct) en una tarea de detección estructurada, al menos en el dominio acotado de las fotografías de edición. Por otro, es un ejemplo práctico de destilación de etiquetas desde un modelo Apache-2.0 hacia un adaptador ligero distribuido bajo la LFM Open License v1.0, con la restricción comercial de ingresos anuales inferiores a 10 millones de dólares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre el modelo vision-lenguaje LiquidAI/LFM3-VL-2B; el adaptador se aplica a las capas de atención y MLP del modelo de lenguaje |
| Parametros totales | no disponible (el adaptador LoRA tiene rango 32 y alpha 32; el modelo base es de 2B parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (uso comercial permitido solo a empresas con ingresos anuales inferiores a 10 millones de dólares) |
| Formato de pesos | safetensors (dos variantes: `lfm3-vl-2b-lora-retouch.safetensors` para el puente ComfyUI de Crackio y `peft/` como adaptador PEFT) |
| Tamano del repositorio | 0,3 GB |
| Modelo base | LiquidAI/LFM3-VL-2B |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 32 insertado en las capas de atención y MLP del modelo de lenguaje del LFM3-VL-2B. No modifica el codificador visual ni la arquitectura del modelo base: se limita a reorientar la generación de texto hacia dos plantillas de salida JSON concretas. La primera plantilla devuelve `{"things": [{"label": ..., "detail": ..., "box": [x0, y0, x1, y1]}]}`, con los objetos ordenados de más a menos prominente y un máximo de 24. La segunda, aplicada sobre un recorte cerrado, devuelve `{"whole": [...], "parts": [{"label": ..., "detail": ..., "box": [...]}]}` con entre 3 y 10 partes. Las cajas se expresan en coordenadas normalizadas de 0 a 1000 sobre la imagen.

El entrenamiento consistió en una época y 435 pasos sobre 3.473 ejemplos: 1.473 fotografías completas para la tarea de objetos y 2.000 recortes cerrados para la tarea de partes. Las imágenes provienen de la biblioteca personal del autor de Crackio y de fotografías generadas por él mismo en la aplicación; los recortes se obtuvieron de esas mismas imágenes. Las etiquetas y cajas fueron generadas íntegramente por Qwen3-VL-8B-Instruct (Apache-2.0) usando los dos prompts propios de Crackio definidos en `src/lib/server/detect.ts`, sin emplear respuestas de modelos cerrados. Las imágenes de entrenamiento tenían hasta 1536 píxeles en el lado largo. No se documenta en la información disponible el uso de RLHF, DPO ni otras fases de alineamiento posteriores al ajuste supervisado.

## Capacidades

- Detección y *grounding* de objetos en imágenes: identifica elementos separados (personas, animales, objetos, cielo, suelo) y devuelve una caja delimitadora por elemento.
- Descripción breve por objeto: cada entrada incluye una etiqueta y un campo `detail` con una descripción corta (por ejemplo, "grey pigeon on the left").
- Descomposición en partes sobre recortes cerrados: descompone un único objeto en entre 3 y 10 partes (pelo, cara, prendas; ruedas, luces y puertas de un vehículo).
- Salida estructurada en JSON con coordenadas normalizadas de 0 a 1000, apta para consumo programático directo.
- Generación incremental: las cajas se emiten a medida que se escriben, lo que permite renderizarlas en streaming.
- Ordenación por prominencia: los objetos se listan de más a menos relevante, con un límite de 24 por imagen.
- Integración con tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo *thinking*, visión o audio adicionales: no disponible en la información proporcionada más allá de la entrada de imagen y texto inherente al modelo base.

## Casos de uso

- Edición fotográfica por clic: el adaptador genera el mapa de objetos de una fotografía y la aplicación permite al usuario seleccionar un elemento concreto para modificarlo de forma aislada. Es adecuado porque devuelve cajas con IoU medio de 0,87 sobre las coincidencias y funciona en la GPU local, sin subir la imagen a un servicio externo.
- Retoque de retratos con descomposición en partes: sobre un recorte cerrado del rostro, el modelo enumera pelo, cara y cada prenda, lo que permite aplicar ajustes selectivos (suavizado de piel, cambio de color de una prenda) sin enmascarado manual.
- Sustitución de fondos y cielos: al detectar el cielo y el suelo como elementos separados, la aplicación puede aislarlos y reemplazarlos conservando el resto de la escena intacto.
- Edición de fotografías de vehículos: la tarea de partes identifica ruedas, luces y puertas de un coche en un recorte, útil para catálogos de automoción o publicaciones de venta donde se quieren resaltar o corregir componentes concretos.
- Procesamiento por lotes en local para estudios fotográficos: el modelo procesa imágenes de hasta 1536 píxeles en el lado largo y emite las cajas en streaming, lo que permite encolar lotes en una estación de trabajo con GPU consumer (RTX 5090) sin coste por inferencia.
- Integración en ComfyUI: el archivo `lfm3-vl-2b-lora-retouch.safetensors` se carga desde `ComfyUI/models/lfm3/` a través del puente de Crackio, lo que permite incorporar la detección como nodo dentro de flujos de generación y edición de imagen ya existentes.
- Servicio HTTP interno: el puente de Crackio expone el modelo en `POST /crackio/lfm3` y `/crackio/lfm3/stream` con el parámetro `"lora": "retouch"`, lo que facilita integrarlo como microservicio de detección en una aplicación de escritorio o web autoalojada.
- Asistencia a la anotación de datasets: las cajas generadas pueden servir como preanotación para revisión humana en proyectos de visión por computador, dado su recall de 0,53 en objetos y 0,68 en partes.

## Benchmarks y rendimiento

Los resultados publicados se midieron sobre 60 imágenes reservadas y 60 recortes de partes reservados. Cada respuesta se comparó con las cajas de Qwen3-VL-8B tras el refinado con SAM 3.1; una caja cuenta como encontrada si solapa con una de referencia con IoU ≥ 0,5.

| Metrica | Este LoRA | LFM3-VL-2B sin ajustar |
|---|---:|---:|
| Objetos: respuestas que parsean | 60/60 | 52/60 |
| Objetos: encontrados por imagen (referencia 14,8) | 14,4 | 7,6 |
| Objetos: recall | 0,53 | 0,33 |
| Objetos: precision | 0,55 | 0,73 |
| Objetos: IoU medio de las coincidencias | 0,87 | no disponible |
| Partes: recall | 0,68 | 0,20 |
| Partes: precision | 0,69 | 0,50 |

El adaptador multiplica por aproximadamente 1,6 el recall en objetos y por 3,4 el recall en partes respecto al modelo base, a costa de una caída de precisión en objetos (0,55 frente a 0,73). El autor señala que el modelo sin ajustar encuentra aproximadamente la mitad de objetos, aunque acierta más entre los que encuentra.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un LoRA sobre un modelo base de 2B parámetros, la huella corresponde prácticamente a la del modelo base más el adaptador (0,3 GB en disco), pero no se publica la cifra exacta.
- GPU recomendadas: el autor cita una RTX 5090 como referencia de rendimiento (primera caja en menos de un segundo, 23 objetos en unos 8 segundos). No se documentan otras GPU.
- Compatibilidad con GPU consumer: sí, según la referencia del autor a la RTX 5090; no se detalla el comportamiento en gamas inferiores.
- Opciones de despliegue: PEFT (cargando `LiquidAI/LFM3-VL-2B` y aplicando `peft/`), puente ComfyUI de Crackio (archivo `lfm3-vl-2b-lora-retouch.safetensors` en `ComfyUI/models/lfm3/`) y servidor HTTP del puente de Crackio en `POST /crackio/lfm3` o `/crackio/lfm3/stream`.
- vLLM, llama.cpp, Ollama y TGI: no disponible en la información proporcionada.
- Latencia y throughput: primera caja en menos de un segundo y 23 objetos en aproximadamente 8 segundos sobre RTX 5090; no se publican cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Crackio Retouch eyes (este) | LoRA sobre base de 2B | no disponible | Grounding y detección de objetos con partes | LFM Open License v1.0 (comercial solo por debajo de 10 M USD de ingresos) | HuggingFace, repo de 0,3 GB |
| LiquidAI/LFM3-VL-2B (base) | 2B | no disponible | Vision-lenguaje general | LFM Open License v1.0 | HuggingFace |
| Qwen/Qwen3-VL-8B-Instruct | 8B | no disponible | Vision-lenguaje general, usado como profesor para las etiquetas | Apache-2.0 | HuggingFace |

La comparación con el modelo base es la más directa: el LoRA mejora el recall de objetos de 0,33 a 0,53 y el de partes de 0,20 a 0,68, con una precisión menor en objetos. Frente a Qwen3-VL-8B-Instruct, que actúa como profesor y referencia de evaluación, el adaptador ofrece un coste de inferencia mucho menor al ejecutarse sobre 2B parámetros y en GPU local, aunque no se publican métricas comparativas directas entre ambos más allá del acuerdo con sus cajas tras el refinado con SAM 3.1.

## Limitaciones y advertencias

- Hereda los sesgos y hábitos del profesor Qwen3-VL-8B-Instruct; el autor menciona explícitamente que tiende a listar la ropa como objetos separados.
- Límite duro de 24 objetos por imagen: las escenas con más elementos quedan truncadas.
- Genera cajas delimitadoras, no contornos: la segmentación precisa requiere SAM 3.1 u otro modelo de segmentación aplicado después del clic.
- Precisión moderada en objetos (0,55): aproximadamente la mitad de las cajas emitidas no coinciden con la referencia con IoU ≥ 0,5, lo que exige revisión o filtrado en producción.
- El conjunto de evaluación y las etiquetas de referencia provienen del mismo profesor y del mismo dominio fotográfico que el entrenamiento, por lo que el rendimiento en otros dominios (imágenes médicas, satelitales, ilustraciones) no está caracterizado.
- Entrenado sobre fotografías de la biblioteca personal del autor y recortes derivados; la diversidad del dataset es limitada y no se documenta su composición demográfica o geográfica.
- No hay información sobre idiomas soportados en la salida (etiquetas y descripciones), ni sobre el comportamiento del modelo base en castellano.
- Restricción de licencia: el uso comercial solo está permitido a empresas con ingresos anuales inferiores a 10 millones de dólares; por encima de ese umbral se requiere licencia adicional de Liquid AI.
- El adaptador es una obra derivada del modelo base y queda sujeto a la LFM Open License v1.0; el archivo `NOTICE` recoge la atribución y los cambios realizados.
- No se publican datos sobre cuantización, por lo que no está claro qué formatos distintos de safetensors son viables.
- Al ser un repositorio con cero descargas y actualizado por última vez en la misma fecha de creación, no existe validación comunitaria independiente de los resultados declarados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TR4F/crackio-retouch
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Modelo profesor y referencia de evaluación: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Repositorio de Crackio: https://github.com/RafalOfficial/Crackio
- Prompts de detección de Crackio: `src/lib/server/detect.ts` del repositorio de Crackio
