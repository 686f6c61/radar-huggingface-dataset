# VD123DV/Krea-2-Kroma-v0.3.1

## Resumen

Krea 2 Kroma v0.3.1 es un modelo de difusion texto-a-imagen derivado de Krea 2 Turbo, publicado por el usuario VD123DV en Hugging Face. Se trata de una reconversion del checkpoint `kroma-v0.3.1-turbo-opd.safetensors` de lodestones/Kroma al formato nativo de la libreria diffusers, empaquetado junto con el resto del pipeline de Krea 2 Turbo para que pueda cargarse directamente mediante `Krea2Pipeline.from_pretrained`. El unico componente que difiere del repositorio original de Krea es el subdirectorio `transformer/`.

El modelo cuenta con 12.820.073.036 parametros (aproximadamente 12,8 mil millones) y un repositorio de 35,7 GB, lo que sugiere pesos en precision alta (probablemente bf16 o fp32) junto con los componentes auxiliares del pipeline (VAE, text encoder, scheduler). La ficha se publica sin descargas ni interacciones en el momento de su creacion, y no es un producto oficial de Krea ni esta respaldado por la compania.

Su relevancia radica en que facilita el uso del fine-tune Kroma dentro del ecosistema diffusers estandar, evitando al desarrollador tener que convertir manualmente los pesos o gestionar un pipeline personalizado. Es un modelo de nicho, orientado a generacion de imagenes y etiquetado como `not-for-all-audiences`, por lo que su evaluacion debe hacerse con cautela en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (text-to-image) basado en transformer; pipeline `Krea2Pipeline` de diffusers |
| Parametros totales | 12.820.073.036 (12,8 mil millones) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se desconoce si hay variantes GGUF/FP8) |
| Idiomas soportados | no disponible (el prompt de texto depende del text encoder del pipeline base) |
| Licencia | krea-2-community-license (enlazada como `LICENSE.pdf` en el repo de Krea 2 Turbo) |
| Formato de pesos | safetensors (formato diffusers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Krea 2 Turbo, un modelo de difusion para generacion de imagenes a partir de texto. La publicacion no detalla la arquitectura interna del transformer de difusion (numero de capas, dimensiones, mecanismo de atencion ni variantes como flow matching o destilacion turbo), mas alla de que el pipeline se invoca como `Krea2Pipeline`. El sufijo "turbo" en el checkpoint de origen (`kroma-v0.3.1-turbo-opd.safetensors`) sugiere una variante optimizada para pocos pasos de inferencia, aunque no se aportan datos concretos sobre el numero de pasos recomendado ni sobre el scheduler.

No se dispone de informacion sobre el dataset de entrenamiento del fine-tune Kroma: no se indica numero de imagenes, resolucion, composicion del dataset, uso de RLHF/DPO ni tecnicas de destilacion. La unica innovacion tecnica documentada es el propio proceso de empaquetado: la conversion del checkpoint a formato diffusers mediante el script `scripts/package_kroma.py` del proyecto Lucent, manteniendo intacto el resto del pipeline de Krea 2 Turbo. El autor declara explicitamente que no es un producto oficial de Krea ni esta respaldado por la compania.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image).
- Integracion nativa con diffusers mediante `Krea2Pipeline.from_pretrained`.
- Compatibilidad con el ecosistema de Krea 2 Turbo: al compartir VAE, text encoder y scheduler, hereda las capacidades del pipeline base.
- Etiquetado como `not-for-all-audiences`, lo que indica que el fine-tune puede producir contenido para adultos o sensible.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo "thinking"; son capacidades no aplicables o no disponibles para este tipo de modelo.
- Soporte multilingue: no disponible; depende del text encoder del pipeline base, no documentado en esta ficha.

## Casos de uso

- Prototipado rapido de pipelines de generacion de imagenes: al cargarse con `Krea2Pipeline.from_pretrained`, permite integrar el fine-tune Kroma en un flujo diffusers existente sin escribir codigo de conversion de pesos.
- Exploracion artistica de estilos: el fine-tune Kroma puede emplearse para generar imagenes con una estetica concreta derivada de su entrenamiento, util en estudios de direccion de arte y pruebas de concepto.
- Generacion de assets para entornos controlados: en proyectos internos donde la licencia comunitaria de Krea 2 sea aceptable, puede producir ilustraciones, fondos o material de referencia.
- Investigacion sobre fine-tunes de difusion: sirve como caso de estudio de como un checkpoint de la comunidad se empaqueta en diffusers y se distribuye junto al pipeline base.
- Evaluacion comparativa de variantes turbo: al compartir arquitectura con Krea 2 Turbo, permite medir el efecto del fine-tune Kroma en calidad y adherencia al prompt manteniendo el mismo pipeline.
- Desarrollo de demos y aplicaciones de imagen generativa: la disponibilidad en safetensors y diffusers facilita su despliegue en servidores con GPUs de gama alta para demos interactivas.
- Contenido para adultos o sensible: el etiquetado `not-for-all-audiences` indica que puede usarse en plataformas con verificacion de edad y politicas adecuadas, siempre que la licencia lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 12,8 mil millones de parametros, en bf16 se requieren aproximadamente 25,6 GB solo para los pesos del transformer, mas el VAE y el text encoder; en fp32 se superarian los 51 GB. Una estimacion conservadora para el pipeline completo en bf16 se situa en el rango de 30-40 GB de VRAM, aunque no se dispone de mediciones oficiales.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o GPUs con 48 GB o mas para ejecutar el pipeline completo en bf16 sin offloading.
- GPU de consumo: no cabe en GPUs consumer de 24 GB (RTX 4090, RTX 3090) sin tecnicas de offloading o cuantizacion; con `enable_model_cpu_offload` o `enable_sequential_cpu_offload` de diffusers podria ejecutarse, a costa de latencia y uso de RAM del sistema.
- Opciones de despliegue: diffusers (principal, segun la model card), con soporte potencial de ComfyUI si existe nodo para Krea 2; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a modelos de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Krea 2 Kroma v0.3.1 (este) | 12,8 mil millones | no disponible | krea-2-community-license | safetensors (diffusers) | Hugging Face, 0 descargas |
| Krea 2 Turbo (base) | no disponible en la informacion | no disponible | krea-2-community-license | safetensors | Hugging Face (repo oficial de Krea) |
| kroma-v0.3.1-turbo-opd (checkpoint original de lodestones) | no disponible en la informacion | no disponible | no disponible | safetensors (formato original) | Hugging Face (repo de lodestones) |

No se dispone de datos de rendimiento ni de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo no oficial: no es un producto de Krea ni esta respaldado por la compania; el soporte y las garantias dependen del autor del empaquetado.
- Licencia restrictiva: la krea-2-community-license impone condiciones especificas para uso comercial; es obligatorio revisar `LICENSE.pdf` y `NOTICE` antes de cualquier despliegue en produccion.
- Contenido sensible: la etiqueta `not-for-all-audiences` indica que el fine-tune puede generar contenido para adultos; requiere moderacion y politicas de uso adecuadas.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede producir imagenes incoherentes, artefactos anatomicos o texto ilegible dentro de la imagen.
- Sesgos: no se documentan sesgos conocidos, pero al no publicarse la composicion del dataset de entrenamiento no es posible evaluar sesgos de genero, etnia o cultura.
- Idiomas: no se especifican los idiomas soportados en los prompts; el rendimiento multilingue depende del text encoder del pipeline base, no documentado aqui.
- Ausencia de benchmarks: no hay metricas publicadas (FID, CLIP score, etc.) que permitan validar la calidad frente a otros modelos.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en produccion ni de validacion por la comunidad.
- Requisitos de hardware elevados: el pipeline completo no cabe en GPUs consumer sin offloading, lo que limita su uso en entornos de desarrollo locales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VD123DV/Krea-2-Kroma-v0.3.1
- Modelo base Krea 2 Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Licencia Krea 2 Community License: https://huggingface.co/krea/Krea-2-Turbo/blob/main/LICENSE.pdf
- Checkpoint original de lodestones/Kroma: no disponible como enlace directo en la informacion proporcionada (referenciado como `lodestones/Kroma`, fichero `kroma-v0.3.1-turbo-opd.safetensors`, commit `94bfb29d748c0cd9319e7d9b489b7f9f3a6f6d92`)
