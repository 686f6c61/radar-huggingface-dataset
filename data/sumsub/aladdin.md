# Sumsub/ALADDIN

## Resumen

ALADDIN es un modelo de intercambio de caras (face-swapping) desarrollado por Sumsub, empresa especializada en verificación de identidad y prevención de fraude. Se trata de un fine-tuning del modelo de difusión FLUX.1-Krea-dev de Black Forest Labs, adaptado específicamente para la tarea de sustitución de rostros en imágenes manteniendo la identidad de origen sobre una escena o cuerpo de destino. El modelo se distribuye bajo una licencia propia denominada `aladdin-license` y está etiquetado explícitamente como `research-only`, es decir, restringido a investigación.

El interés de ALADDIN reside en su origen y propósito: un proveedor de KYC/verificación de identidad publica una herramienta de manipulación facial, presumiblemente como base para estudiar y detectar deepfakes y ataques de presentación en sistemas de verificación biométrica. El repositorio ocupa 5,7 GB en formato safetensors y está sujeto a acceso restringido (gated) en Hugging Face, requiriendo aceptar condiciones antes de su descarga.

No se dispone de información pública sobre el número de parámetros, la longitud de contexto (no aplica en modelos de difusión en el sentido de LLM), los idiomas soportados ni los datos de entrenamiento empleados. La ficha se limita, por tanto, a lo que puede inferirse de los metadatos y de la arquitectura base FLUX.1-Krea-dev.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (fine-tuning de FLUX.1-Krea-dev; familia transformer de flujo, detalles exactos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica / no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | aladdin-license (research-only, acceso restringido) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 5,7 GB |
| Modelo base | black-forest-labs/FLUX.1-Krea-dev |
| Tarea principal | face-swapping (intercambio de rostros) |
| Acceso | gated (requiere aceptar condiciones en Hugging Face) |

## Arquitectura y entrenamiento

ALADDIN hereda la arquitectura de FLUX.1-Krea-dev, un modelo de difusion de la familia FLUX de Black Forest Labs orientado a generacion de imagen con estetica fotografica. El fine-tuning se ha realizado sobre ese checkpoint base para especializarlo en la tarea de face-swapping: dada una imagen de identidad y una imagen de destino, el modelo genera una composicion en la que el rostro de origen se integra en la escena de destino. No se han publicado detalles sobre el conjunto de datos de entrenamiento, el numero de pasos de fine-tuning, el uso de tecnicas como LoRA o ajuste completo, ni sobre posibles etapas de refinamiento o control de identidad.

No hay informacion disponible sobre el volumen de datos, la composicion del dataset, el uso de RLHF/DPO (poco habitual en modelos de difusion) ni innovaciones tecnicas especificas mas alla de la propia adaptacion del modelo base. El repositorio incluye una referencia a un paper con identificador arXiv:2610.37503, que presumiblemente documenta el metodo, pero su contenido no se ha proporcionado en la informacion disponible.

## Capacidades

- Intercambio de rostros en imagenes: integra la identidad facial de una imagen de origen sobre una escena o cuerpo de destino.
- Generacion de imagen fotorrealista heredada de FLUX.1-Krea-dev.
- Preservacion de identidad: el objetivo del fine-tuning es mantener los rasgos faciales de la persona de origen en la imagen generada.
- Aplicable a pipelines de investigacion sobre deepfakes y deteccion de manipulacion facial.
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (no es un modelo de lenguaje).
- No se ha documentado soporte de vision como entrada en el sentido de un VLM; la entrada es imagen (identidad y destino) y la salida es imagen.

## Casos de uso

- Investigacion en deteccion de deepfakes: generar un corpus controlado de imagenes con rostros intercambiados para entrenar y evaluar detectores de manipulacion facial en sistemas de KYC.
- Evaluacion de sistemas de verificacion de identidad: probar la robustez de pipelines de prueba de vida (liveness) y comparacion facial frente a ataques de suplantacion sintetica.
- Analisis de sesgos en biometria facial: estudiar como se comportan los verificadores ante rostros sinteticos de distintas demografias.
- Pruebas de regresion en productos anti-fraude: crear casos de prueba reproducibles para validar que un motor de deteccion rechaza imagenes manipuladas.
- Investigacion academica sobre privacidad y anonimizacion facial: explorar tecnicas de sustitucion de rostro con fines de proteccion de identidad, siempre dentro del marco research-only.
- Benchmarking de modelos de difusion para edicion facial: comparar la calidad de integracion y la fidelidad de identidad frente a otros metodos de face-swapping en entornos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Por el tamano del repositorio (5,7 GB en safetensors) y la arquitectura base FLUX.1-Krea-dev, se requiere una GPU con VRAM suficiente para ejecutar el modelo base; no se dispone de cifras concretas para ALADDIN.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base FLUX.1-Krea-dev y de la cuantizacion empleada, dato no disponible.
- Opciones de despliegue: no disponible (no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; al ser un modelo de difusion, el despliegue tipico seria via `diffusers` u otro runtime de difusion, pero no se confirma en la informacion).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables de face-swapping ni resultados que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia `aladdin-license` con etiqueta `research-only`: el uso comercial esta restringido y requiere revisar los terminos exactos de la licencia.
- Acceso gated: es necesario aceptar condiciones en Hugging Face antes de descargar el modelo.
- Riesgo elevado de uso malicioso: la suplantacion de identidad facial es una tecnologia de doble uso; su empleo fuera de investigacion puede facilitar fraude, suplantacion y desinformacion.
- Posibles sesgos demograficos heredados del modelo base y de los datos de entrenamiento, no documentados.
- Riesgo de artefactos y alucinaciones visuales: como modelo de difusion, puede generar inconsistencias en iluminacion, textura de piel o limites del rostro.
- Sin informacion publica sobre el dataset de entrenamiento, lo que limita la evaluacion de sesgos y de calidad.
- No apto para produccion sin una evaluacion etica y legal previa; su uso en sistemas de verificacion reales debe acompanarse de controles anti-suplantacion.

## Enlaces

- Hugging Face: https://huggingface.co/Sumsub/ALADDIN
- Paper referenciado (arXiv:2610.37503): https://arxiv.org/abs/2610.37503
- Modelo base FLUX.1-Krea-dev: https://huggingface.co/black-forest-labs/FLUX.1-Krea-dev
