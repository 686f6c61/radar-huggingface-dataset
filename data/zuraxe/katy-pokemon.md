# zuraxe/katy-pokemon

## Resumen

Katy - Pokemon es un adaptador LoRA de personaje para modelos de difusion de imagenes basados en SDXL, concretamente disenado para funcionar sobre checkpoints de la familia Illustrious XL (la metadata embebida identifica como base AnyIllustrious XL v0.1.1 / SDXL epsilon). Lo publica el estudio NSFWstudio a traves de la plataforma Renderoverse, y este repositorio de Hugging Face es un espejo que preserva los pesos gratuitos de la version 1.0.0 sin modificar el archivo original. No es un modelo autonomo: requiere cargarse junto a un checkpoint SDXL compatible.

El modelo resuelve un problema acotado y muy especifico: la generacion consistente de un personaje concreto (Katy, de tematica Pokemon) en un pipeline de text-to-image. Se distribuye como un unico archivo safetensors de 185.718.840 bytes (aproximadamente 177 MiB, coherente con el tamano de repo de 0.2 GB), lo que corresponde a un LoRA de rango bajo sobre un UNet SDXL. Su relevancia es practica para creadores que trabajan con checkpoints Illustrious y necesitan un adaptador ligero de personaje, no para investigacion de modelos fundacionales.

La ficha se limita a los datos disponibles en la model card y los metadatos del repositorio. El autor no publica informacion sobre el dataset de entrenamiento, hiperparametros, benchmarks ni evaluaciones de calidad de imagen, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de SDXL; base declarada AnyIllustrious XL v0.1.1 / SDXL epsilon |
| Parametros totales | no disponible (adaptador LoRA; el checkpoint base SDXL no se incluye) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; la cuantizacion depende del checkpoint base y del runtime) |
| Idiomas soportados | no disponible (los prompts dependen del text encoder del checkpoint base) |
| Licencia | MIT |
| Formato de pesos | safetensors (185.718.840 bytes; SHA-256 f1099ef6e313b421620b0d8fa660c0486c4e2fc0caab6481e9773546bf44e7a9) |

## Arquitectura y entrenamiento

El artefacto es un LoRA de personaje, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del UNet de un modelo SDXL. La model card identifica la base como AnyIllustrious XL v0.1.1 con prediccion epsilon, una variante de la familia Illustrious XL orientada a ilustracion y estilos anime. El archivo pesa unos 177 MiB, un orden de magnitud tipico para adaptadores LoRA de personaje sobre SDXL, muy por debajo de los varios GB de un checkpoint completo.

No se publica informacion sobre el dataset de entrenamiento: ni numero de imagenes, ni composicion, ni resolucion, ni si se uso regularizacion, captions automaticos o tecnicas como LoRA de rango variable. Tampoco se documentan hiperparametros (learning rate, pasos, rango, alpha) ni procesos de ajuste adicionales como RLHF o DPO, que en este dominio no aplican. La unica innovacion tecnica reseñable es el uso de dos triggers explicitos: `katy_renderoverse` para el personaje y `Katyoutfit` para el atuendo, lo que permite controlar por separado identidad y vestuario en el prompt.

## Capacidades

- Generacion text-to-image de un personaje concreto (Katy) sobre checkpoints SDXL de la familia Illustrious.
- Control de identidad mediante el trigger `katy_renderoverse`.
- Control independiente del atuendo mediante el trigger `Katyoutfit`.
- Integracion como nodo Load LoRA en ComfyUI y en otros runtimes compatibles con LoRA SDXL.
- Ajuste de intensidad (strength) del adaptador para equilibrar fidelidad al personaje y libertad creativa del checkpoint base.
- Compatibilidad con el ecosistema de prompts, samplers y schedulers de SDXL.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento: es un modelo puramente generativo de imagen.
- No dispone de capacidades de vision, audio ni comprension de lenguaje natural mas alla del text encoder del checkpoint base.

## Casos de uso

- Ilustracion de personaje consistente en series: usar `katy_renderoverse` con un checkpoint Illustrious para generar un conjunto de imagenes del mismo personaje con variaciones de pose y escena, manteniendo la identidad visual entre ilustraciones.
- Diseno de variantes de vestuario: combinar `katy_renderoverse` con `Katyoutfit` para producir versiones alternativas del atuendo sin perder el rostro ni la silueta del personaje.
- Prototipado rapido de arte para proyectos de fan art o ficcion: el adaptador pesa unos 177 MiB y se carga en segundos, lo que permite iterar prompts en ComfyUI sin recargar un checkpoint completo.
- Generacion de material para narrativa visual (comics, novelas ligeras): mantener al personaje coherente a lo largo de varias paginas usando el mismo LoRA y seed base.
- Creacion de assets para juegos o mods de tematica Pokemon: generar retratos y sprites de referencia del personaje para documentacion de diseno.
- Pruebas de estilo sobre distintos checkpoints Illustrious: al ser un adaptador ligero, permite evaluar como cambia el personaje segun el checkpoint base sin reentrenar nada.
- Uso educativo en tecnicas de LoRA: sirve como ejemplo practico de adaptador de personaje con triggers separados de identidad y vestuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se suministra ninguna evaluacion de calidad de imagen ni benchmark con este espejo, y que los resultados dependen del checkpoint base, del prompt y de los ajustes.

## Requisitos de hardware

- VRAM estimada para inferencia: depende enteramente del checkpoint SDXL base, no del LoRA. Un SDXL en fp16 requiere aproximadamente 10-12 GB de VRAM para generar a 1024x1024; el LoRA anade un consumo marginal (unos cientos de MB).
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB) o H100 para lotes grandes y alta resolucion; RTX 3090 (24 GB) y RTX 4080 (16 GB) son suficientes para inferencia individual.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas usando cuantizacion del checkpoint base (fp8 o GGUF) y offloading; con 12 GB o mas en fp16 sin problemas.
- Opciones de despliegue: ComfyUI (nodo Load LoRA, ruta `ComfyUI/models/loras`), Automatic1111/Forge, Diffusers con `load_lora_weights`, y runtimes con soporte de LoRA SDXL como ComfyUI portable o InvokeAI.
- Latencia y throughput estimados: no disponibles; dependen del checkpoint, la GPU, la resolucion y el numero de pasos. No se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Como referencia estructural, un LoRA de personaje SDXL tipico comparte categoria con adaptadores de la misma familia (por ejemplo, LoRAs de personaje publicados para Illustrious o Pony), pero no se aportan datos de parametros, contexto ni rendimiento de alternativas concretas, por lo que la comparacion cuantitativa se marca como no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Katy - Pokemon (este) | LoRA sobre SDXL (tamano de archivo 177 MiB) | no aplica | sin benchmarks publicados | MIT | Hugging Face (espejo) y Renderoverse |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo autonomo: sin un checkpoint SDXL compatible (preferiblemente Illustrious XL) no genera nada.
- Resultados muy sensibles al checkpoint base, al prompt, al sampler y al strength del LoRA; la model card no garantiza calidad consistente.
- No se documenta el dataset de entrenamiento, por lo que no se puede evaluar el riesgo de sesgos, sobreajuste o memorizacion de imagenes concreta.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta, artefactos o elementos incoherentes, especialmente con prompts complejos.
- La licencia MIT cubre el artefacto LoRA, pero no concede derechos sobre personajes, nombres ni marcas de terceros; el personaje Katy y la franquicia Pokemon pertenecen a sus titulares y este no es un lanzamiento oficial.
- El repositorio incluye la etiqueta `not-for-all-audiences`, lo que indica que el modelo puede producir contenido para adultos; conviene aplicar filtros y politicas de uso en produccion.
- El espejo no incluye evaluacion de calidad ni ejemplos generados nuevos; la unica imagen de preview procede del listado original.
- Fecha de creacion y actualizacion del repositorio (2026) y ausencia de descargas y likes: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zuraxe/katy-pokemon
- Listado original en Renderoverse: https://renderoverse.com/model/katy-pokemon
- Plataforma del autor: https://renderoverse.com/
- Preview del autor: images/katy-pokemon-source-cover.webp (dentro del repositorio)
