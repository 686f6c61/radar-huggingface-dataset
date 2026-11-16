# zuraxe/ubume-renderoverse-illustrious-lora

## Resumen

Ubume - Ninja scroll es un LoRA de personaje para modelos de difusion SDXL, desarrollado por NSFWstudio y distribuido a traves de la plataforma Renderoverse. El repositorio de Hugging Face, publicado por el usuario zuraxe, es un espejo que preserva los pesos de la version gratuita 1.0.0 sin modificar el archivo original. Se trata de un adaptador, no de un checkpoint autonomo: requiere un modelo base SDXL compatible para funcionar, y los metadatos embebidos identifican como base AnyIllustrious XL v0.1.1 con prediccion epsilon.

El modelo resuelve un problema acotado: la reproduccion consistente de un personaje concreto (Ubume, del universo Ninja Scroll) en flujos de generacion texto-a-imagen. Con 185.719.696 bytes (aproximadamente 0,2 GB), el adaptador es ligero y se integra en pipelines existentes de SDXL sin necesidad de reentrenar el checkpoint base. Su relevancia es practica para ilustradores y desarrolladores que construyen aplicaciones de generacion de imagenes con personajes fijos.

La ficha se basa exclusivamente en la informacion publicada en el repositorio. No hay datos de benchmarks, evaluaciones de calidad de imagen ni metricas de rendimiento disponibles, y el autor no proporciona informacion sobre el proceso de entrenamiento mas alla de la identificacion del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL; el checkpoint base identificado en metadatos es AnyIllustrious XL v0.1.1 / SDXL epsilon |
| Parametros totales | no disponible (adaptador LoRA; el archivo pesa 185.719.696 bytes) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; la ventana de prompt depende del codificador de texto del checkpoint base) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; la cuantizacion aplicable es la del checkpoint base) |
| Idiomas soportados | no disponible (los prompts dependen del codificador de texto del modelo base) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA pensado para inyectarse en las capas de atencion de un UNet SDXL. El tamano del archivo (unos 185,7 MB) es coherente con un LoRA de rango bajo orientado a un unico concepto de personaje, no con un fine-tuning completo. Los metadatos embebidos declaran como base AnyIllustrious XL v0.1.1 con parametrizacion epsilon, lo que condiciona la compatibilidad: el adaptador esta calibrado para ese checkpoint y su rendimiento puede degradarse con otros modelos SDXL.

La model card no detalla el numero de imagenes de entrenamiento, la composicion del dataset, el numero de pasos ni si se aplicaron tecnicas de regularizacion o captions especificos. Solo se indica que el conjunto de entrenamiento incluye imagenes vestidas y desnudas del personaje, motivo por el cual el repositorio esta marcado como no apto para todas las audiencias. No se documenta el uso de RLHF, DPO ni ninguna innovacion de decodificacion, algo por otra parte ajeno a este tipo de adaptadores.

## Capacidades

- Generacion de imagenes de un personaje concreto (Ubume, universo Ninja Scroll) a partir de prompts de texto, condicionada por el checkpoint base SDXL.
- Control de vestuario mediante el trigger `Ubumeoutfit`, separado del trigger de personaje `ubume_renderoverse`.
- Integracion en ComfyUI mediante el nodo Load LoRA, con ajuste de fuerza (strength) por prompt y checkpoint.
- Compatibilidad con el ecosistema SDXL: puede combinarse con otros LoRA, ControlNet y tecnicas de img2img soportadas por el pipeline base.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking: es un modelo generativo de imagen, no un LLM.
- Capacidades multilingues no documentadas; dependen del codificador de texto del checkpoint base.

## Casos de uso

- Ilustracion de personaje consistente: un ilustrador fija el trigger `ubume_renderoverse` para mantener la identidad visual del personaje a lo largo de una serie de imagenes, variando composicion y estilo mediante el prompt.
- Produccion de storyboards y comics: al ser un adaptador ligero, permite generar paneles sucesivos del mismo personaje dentro de un flujo ComfyUI, reduciendo la deriva visual entre viñetas.
- Prototipado de personajes para videojuegos o animacion: el equipo de arte genera referencias rapidas del personaje en distintos angulos y vestuarios usando el trigger de outfit, antes de modelar en 3D.
- Personalizacion de aplicaciones de generacion de imagenes: un desarrollador integra el LoRA en un backend SDXL para ofrecer al usuario un personaje predefinido, cargando el safetensors en la carpeta de LoRA del servicio.
- Experimentacion con tecnicas de composicion: combinacion del adaptador con ControlNet o img2img para transferir la identidad del personaje a poses y escenas controladas, aprovechando que el LoRA no altera el checkpoint base.
- Investigacion sobre LoRA de personaje: el repositorio sirve como ejemplo reproducible (hash SHA-256 publicado) para estudiar el efecto de la fuerza del adaptador y la eleccion del checkpoint base en la fidelidad del personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que este espejo no incluye evaluacion de calidad de imagen ni metricas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: la del checkpoint base SDXL, tipicamente entre 6 y 10 GB en FP16 segun resolucion y optimizaciones; el LoRA anade una sobrecarga marginal (archivo de 0,2 GB).
- GPU recomendadas: NVIDIA RTX 3060 12 GB o superior para SDXL en FP16; A100 o H100 para despliegues por lotes de alta concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas aplicando offloading o cuantizacion del base; con 12 GB o mas se opera con comodidad.
- Opciones de despliegue: ComfyUI (flujo indicado por el autor), Automatic1111/Forge, Diffusers con `load_lora_weights`, y servidores de inferencia compatibles con SDXL.
- Latencia y throughput: no disponibles; dependen enteramente del checkpoint base, la GPU y la resolucion de salida.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ubume - Ninja scroll (este) | LoRA de personaje | AnyIllustrious XL v0.1.1 / SDXL epsilon | 185,7 MB | MIT | Hugging Face (espejo) y Renderoverse |
| LoRA de personaje SDXL genericos | LoRA de personaje | SDXL o variantes Illustrious | variable | variable (muchos en CreativeML OpenRAIL-M o similares) | Civitai, Hugging Face |
| Checkpoint SDXL completo | Checkpoint base | SDXL | varios GB | CreativeML OpenRAIL++-M | Hugging Face, Stability AI |

No se dispone de datos de rendimiento comparativo entre este adaptador y alternativas de la misma categoria, por lo que la comparacion se limita a tipo de artefacto, base, tamano y licencia.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: sin un checkpoint SDXL compatible no genera nada, y con bases distintas de AnyIllustrious XL v0.1.1 la fidelidad al personaje puede caer.
- Contenido no apto para todas las audiencias: el dataset de entrenamiento incluye imagenes sin ropa, segun los metadatos; el repositorio esta marcado en consecuencia.
- La licencia MIT cubre el artefacto, pero no otorga derechos sobre el personaje, nombres o marcas de terceros; el autor declara que no es un lanzamiento oficial de los titulares de derechos.
- Riesgo de sobreajuste al estilo del checkpoint base y de deriva del personaje con fuerzas de LoRA altas o prompts muy alejados del dominio de entrenamiento.
- No hay evaluacion de sesgos ni de calidad de imagen publicada; en produccion conviene validar manualmente las salidas.
- El repositorio es un espejo de terceros: la trazabilidad del entrenamiento depende de la publicacion original en Renderoverse.
- Ausencia de datos sobre idiomas de prompt, resolucion de entrenamiento y numero de pasos; estos parametros deben ajustarse empiricamente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zuraxe/ubume-renderoverse-illustrious-lora
- Publicacion original en Renderoverse: https://renderoverse.com/model/ubume-ninja-scroll
- Plataforma Renderoverse: https://renderoverse.com/
