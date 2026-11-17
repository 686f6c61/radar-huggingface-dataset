# zuraxe/ubume-ninja-scroll

## Resumen

Ubume - Ninja scroll es un adaptador LoRA de personaje para generacion de imagenes con Stable Diffusion XL, desarrollado por NSFWstudio y distribuido a traves de la plataforma Renderoverse. El repositorio de Hugging Face, publicado por el usuario zuraxe, es un espejo que preserva sin modificaciones los pesos de la version gratuita 1.0.0. No se trata de un checkpoint autonomo, sino de un adaptador que debe cargarse sobre un modelo base compatible.

El modelo esta etiquetado con los identificadores `sdxl` e `illustrious`, y sus metadatos internos identifican el base de referencia como AnyIllustrious XL v0.1.1 con prediccion epsilon de SDXL. El adaptador ocupa 185.719.696 bytes (aproximadamente 0,2 GB) en formato Safetensors y se activa mediante los triggers de personaje `ubume_renderoverse` y de vestuario `Ubumeoutfit`.

Su relevancia es acotada: se dirige a usuarios que necesitan reproducir un personaje concreto dentro de flujos de trabajo de SDXL/Illustrious en ComfyUI u otras interfaces compatibles. El repositorio esta marcado como no apto para todos los publicos, ya que los metadatos embebidos describen imagenes de entrenamiento con y sin ropa. No se ha publicado ninguna evaluacion de calidad de imagen ni benchmark asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL con prediccion epsilon |
| Parametros totales | no disponible (adaptador de 185.719.696 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image) |
| Tipos de cuantizacion | no disponible (pesos Safetensors en el formato original del adaptador) |
| Idiomas soportados | no disponible (los prompts dependen del codificador de texto del base) |
| Licencia | MIT |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA pensado para inyectarse en las capas de atencion y proyeccion de un UNet de SDXL. Los metadatos embebidos en el archivo identifican como base de referencia AnyIllustrious XL v0.1.1, un modelo derivado de la familia Illustrious que opera con prediccion epsilon. El tamano del archivo (185,7 MB) es coherente con un adaptador de rango bajo orientado a un unico concepto de personaje, no con un fine-tuning completo.

No se dispone de informacion sobre el numero de imagenes de entrenamiento, la composicion del dataset, la resolucion de las muestras, el rango del LoRA ni la configuracion de hiperparametros. Tampoco se documenta el uso de tecnicas como regularizacion por captions, debiasing o entrenamiento por etapas. La model card solo indica que el conjunto de entrenamiento incluye imagenes con y sin ropa, motivo por el que el repositorio se marca como no apto para todos los publicos.

## Capacidades

- Generacion text-to-image de un personaje concreto mediante el trigger `ubume_renderoverse`.
- Control de vestuario mediante el trigger independiente `Ubumeoutfit`.
- Integracion como capa LoRA en pipelines de SDXL compatibles, incluido ComfyUI mediante el nodo Load LoRA.
- Ajuste de intensidad del adaptador (strength) para modular la fidelidad al personaje frente a la libertad creativa del prompt.
- Compatibilidad declarada con checkpoints de la familia Illustrious XL y, por extension, con buena parte del ecosistema SDXL.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un adaptador de difusion para imagen.
- No se documentan capacidades multilingues propias; la comprension de prompts depende del codificador de texto del checkpoint base.

## Casos de uso

- Ilustracion de personaje consistente en series: usar el trigger `ubume_renderoverse` con distintas semillas y prompts de escena para mantener la identidad del personaje a lo largo de varias imagenes de un mismo proyecto editorial o comic.
- Diseno de variantes de vestuario: combinar `Ubumeoutfit` con descripciones textuales de prendas para generar propuestas de indumentaria sobre el mismo personaje sin reentrenar el adaptador.
- Prototipado rapido en ComfyUI: cargar el archivo en `ComfyUI/models/loras` y encadenar el nodo Load LoRA con un checkpoint Illustrious para iterar sobre bocetos en minutos.
- Creacion de material para juegos de rol o narrativa interactiva: generar retratos y poses del personaje con coherencia visual para fichas, manuales o assets de ambientacion.
- Pruebas de concepto de estilo anime en pipelines SDXL: evaluar como responde un checkpoint Illustrious a un LoRA de personaje concreto antes de invertir en un fine-tuning propio.
- Generacion de referencias para artistas: producir paneles de referencia de angulos y expresiones que sirvan como base para ilustracion manual posterior.
- Experimentacion con control de intensidad: barridos de strength para estudiar el equilibrio entre fidelidad al personaje y adherencia al prompt, util en investigacion sobre adaptadores de bajo rango.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que este espejo no incluye ninguna evaluacion de calidad de imagen ni metricas de rendimiento.

## Requisitos de hardware

- VRAM estimada: depende enteramente del checkpoint base SDXL/Illustrious, no del adaptador. Un SDXL en fp16 requiere del orden de 8-10 GB de VRAM para inferencia; el LoRA anade una sobrecarga marginal (menos de 1 GB) al cargarse en memoria.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100 para el base; el adaptador en si no impone requisitos adicionales.
- Cabe en GPU de consumo: si, siempre que el checkpoint base quepa. Con cuantizacion del base (por ejemplo, fp8 o GGUF para SDXL) puede ejecutarse en GPUs de 6-8 GB.
- Opciones de despliegue: ComfyUI (nodo Load LoRA), Automatic1111/Forge, Diffusers con `load_lora_weights`, y cualquier runtime que soporte LoRA sobre SDXL.
- Latencia y throughput: no disponibles; dependen del base, la GPU, la resolucion y el numero de pasos de muestreo.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ubume - Ninja scroll (este) | LoRA de personaje | AnyIllustrious XL v0.1.1 / SDXL epsilon | 185,7 MB | MIT | Hugging Face (espejo) y Renderoverse |
| LoRA de personaje SDXL generico | LoRA de personaje | SDXL 1.0 | variable, tipicamente 100-200 MB | variable segun autor | Civitai, Hugging Face |
| LoRA de estilo Illustrious | LoRA de estilo | Illustrious XL | variable | variable | Civitai, Hugging Face |

No se dispone de datos de rendimiento comparado para este adaptador, por lo que la comparativa se limita a aspectos de formato, base y licencia. Cualquier comparacion cualitativa de calidad de imagen requeriria una evaluacion que no se ha publicado.

## Limitaciones y advertencias

- Es un adaptador, no un checkpoint: sin un base SDXL/Illustrious compatible no genera imagenes por si solo.
- Contenido no apto para todos los publicos: los metadatos describen imagenes de entrenamiento con y sin ropa; el repositorio esta marcado como `not-for-all-audiences`.
- La licencia MIT cubre el artefacto, pero no concede derechos sobre personajes, nombres o marcas de terceros; no es un lanzamiento oficial de los titulares de esos derechos.
- Riesgo de sobreajuste al estilo del base de referencia: los resultados pueden degradarse si se usa con checkpoints SDXL alejados de Illustrious.
- No hay evaluacion de calidad, sesgos ni robustez publicada; se desconoce el comportamiento del adaptador fuera del dominio de entrenamiento.
- Riesgo de alucinacion visual (anatomia incorrecta, artefactos en manos y rostros) inherente a los modelos de difusion SDXL, no mitigado por este adaptador.
- El repositorio es un espejo de terceros; la trazabilidad de actualizaciones depende del autor original en Renderoverse.
- Uso comercial: permitido por la licencia MIT del adaptador, pero sujeto a las condiciones del checkpoint base y a la legalidad del contenido generado en la jurisdiccion de uso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zuraxe/ubume-ninja-scroll
- Publicacion original en Renderoverse: https://renderoverse.com/model/ubume-ninja-scroll
- Plataforma Renderoverse: https://renderoverse.com/
