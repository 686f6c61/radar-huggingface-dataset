# Wan-AI/Wan2.2-Animate-14B

## Resumen

Wan2.2-Animate-14B es un modelo de difusión vídeo a vídeo desarrollado por Wan-AI (equipo de Alibaba) especializado en animación de personajes y sustitución de personajes mediante replicación holística de movimiento y expresiones. Forma parte de la familia Wan2.2, presentada como una actualización de los modelos fundacionales de vídeo de Wan, y fue publicado el 19 de septiembre de 2025, con última actualización de pesos el 5 de noviembre de 2025.

El modelo se construye sobre Wan-AI/Wan2.2-I2V-A14B y adopta una arquitectura de Mixture-of-Experts (MoE) aplicada a la difusión de vídeo, donde el proceso de eliminación de ruido se reparte entre expertos especializados por tramos temporales. Aunque se comercializa con la etiqueta "14B", el recuento real de parámetros en safetensors es de 17.274.817.108, con aproximadamente 14B activos por paso. El repositorio ocupa 72,5 GB e incluye pesos en safetensors y ONNX.

Su relevancia actual radica en que unifica dos tareas que tradicionalmente requerían modelos separados (animación de personaje y reemplazo de personaje) en un único modelo abierto con licencia Apache 2.0, algo poco habitual en el segmento de generación de vídeo cinematográfico, dominado por soluciones cerradas. Acumula 172.847 descargas y 1.289 "likes" en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) con Mixture-of-Experts (MoE) |
| Parametros totales | 17.274.817.108 (nominal "14B") |
| Parametros activos | Aproximadamente 14B (denominacion A14B del modelo base) |
| Longitud de contexto | No disponible (modelo de video; entrada de video + imagen de referencia) |
| Tipos de cuantizacion | FP8 (soportado via DiffSynth-Studio); pesos ONNX disponibles; cuantizaciones adicionales no confirmadas |
| Idiomas soportados | No disponible (prompts en texto; no se declaran idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

Wan2.2-Animate-14B es un modelo de difusión de vídeo basado en la arquitectura MoE introducida en Wan2.2. El proceso de denoising se divide entre modelos expertos especializados según el nivel de ruido temporal, lo que permite ampliar la capacidad total del modelo manteniendo un coste computacional por paso equivalente al de un modelo denso de menor tamaño. Deriva directamente de Wan2.2-I2V-A14B (image-to-video), del que hereda el espacio latente y el codificador de texto, y anade las capacidades de animacion y sustitucion de personaje. El modelo usa el VAE de Wan2.2, con una tasa de compresion declarada de 16×16×4 en la variante 5B de la familia.

En cuanto al entrenamiento, la familia Wan2.2 se entreno con un conjunto de datos significativamente mayor que Wan2.1, con un +65,6 % mas de imagenes y un +83,2 % mas de videos. Se incorporaron datos esteticos etiquetados con atributos de iluminacion, composicion, contraste y tono de color para permitir un control mas preciso del estilo cinematografico. No se especifica en la informacion disponible el numero total de tokens ni si hubo fases de RLHF o DPO (no aplicables de forma estandar a modelos de difusion). Si se menciona soporte de sintesis de voz a texto con CosyVoice para la variante speech-to-video, asi como el soporte a traves de DiffSynth-Studio (offload por capas, cuantizacion FP8, paralelismo de secuencia y entrenamiento LoRA/total).

## Capacidades

- Animacion de personaje: transfiere movimientos y expresiones desde un video conductor a un personaje de una imagen o video de referencia.
- Sustitucion de personaje (character replacement): reemplaza un personaje dentro de un video manteniendo el movimiento original.
- Replicacion holistico de movimientos corporales y expresiones faciales.
- Generacion de video a partir de video conductor (pipeline video-to-video), con soporte de entrada de imagen de referencia.
- Control estetico cinematografico: etiquetas de iluminacion, composicion, contraste y tono de color.
- Integracion en ComfyUI (con el WanVideoWrapper de Kijai y soporte oficial).
- Compatibilidad con pipelines de Diffusers (libreria declarada en HuggingFace).
- Soporte de cuantizacion FP8 y offload por capas para reducir requisitos de VRAM.
- No se declara soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- Produccion audiovisual y postproduccion: sustitucion de actores o dobles en escenas ya rodadas, replicando el movimiento original del actor sobre otro personaje sin volver a rodar.
- Animacion de personajes para publicidad: animar un personaje de marca a partir de un video de referencia con una persona realizando la accion, manteniendo expresiones coherentes.
- Creacion de contenido para redes sociales: convertir un video grabado con un movil en una version con personaje virtual, usando la imagen de referencia del avatar.
- Doblaje visual para localizacion: adaptar videos de un personaje a una version concreto con movimiento y expresion consistentes en distintos idiomas visuales, apoyandose en la entrada video-to-video.
- Previsualizacion de animacion (previz) en estudios: generar pruebas de movimiento para personajes antes de la animacion final, reduciendo costes de iteracion.
- Videojuegos y avatares: generar animaciones de personaje a partir de captura de movimiento de bajo coste para prototipos de NPC o avatares.
- Investigacion en generacion de video: servir como base para experimentos de transferencia de movimiento, entrenamiento LoRA con DiffSynth-Studio y evaluacion de arquitecturas MoE en difusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma que Wan2.2 alcanza un rendimiento "TOP" entre modelos abiertos y cerrados, pero no se proporcionan cifras numericas (FVD, SSIM, LPIPS, VBench u otros) para Wan2.2-Animate-14B en los materiales facilitados.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 34-35 GB para los 17,27B parametros (sin contar activaciones ni latentes de video, que elevan el pico).
- VRAM estimada con cuantizacion FP8: aproximadamente 17-18 GB para los pesos, mas margen para activaciones.
- GPU profesionales recomendadas: A100 80 GB, H100 80 GB, H200 para lotes grandes y resoluciones altas.
- GPU de consumo: puede ejecutarse en RTX 4090 (24 GB) y RTX 5090 combinando FP8 y offload por capas, segun el soporte declarado en DiffSynth-Studio; en gamas inferiores el offload a CPU/VRAM es probablemente necesario.
- Nota: el modelo de 5B de la familia Wan2.2 (TI2V-5B) esta disenado explicitamente para GPU de consumo como la 4090 a 720p y 24 fps; el Animate-14B, al ser notablemente mayor, no declara ese nivel de ligereza.
- Opciones de despliegue: Diffusers, ComfyUI (wrapper de Kijai y soporte oficial), DiffSynth-Studio (offload por capas, FP8, paralelismo de secuencia, LoRA). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a difusion de video).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.2-Animate-14B | 17,27B (≈14B activos) | Video-to-video, animacion y sustitucion de personaje | Video + imagen de referencia | Apache 2.0 | Pesos abiertos (HF, ModelScope, ComfyUI, Diffusers) |
| Wan2.2-I2V-A14B (modelo base) | ≈14B activos | Image-to-video | Imagen + texto | Apache 2.0 | Pesos abiertos |
| Wan2.2-S2V-14B | ≈14B activos | Speech-to-video con audio | Audio + imagen | Apache 2.0 | Pesos abiertos |
| Wan2.2-TI2V-5B | 5B | Text-to-video e image-to-video a 720p/24fps | Texto/imagen | Apache 2.0 | Pesos abiertos, orientado a GPU de consumo |

Alternativas cerradas de animacion de personaje (por ejemplo Runway Act-One) no publican parametros ni contexto y no se dispone de datos comparativos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse con datos esteticos curados y videos, puede reproducir sesgos de representacion de genero, etnia o cuerpo presentes en los datos.
- Alucinacion y artefactos: como modelo de difusion, puede generar artefactos temporales, incoherencias de identidad o deformaciones en movimientos rapidos; no se aportan metricas de fidelidad.
- Limitaciones de contexto e idioma: no se declaran idiomas soportados ni longitud de contexto; la calidad de los prompts de texto no esta garantizada en castellano.
- Uso etico y legal: la sustitucion de personajes y la animacion de caras plantea riesgos de deepfake y suplantacion; el usuario es responsable del consentimiento de las personas representadas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar los terminos adicionales del ecosistema Wan (sitio wan.video, guias de uso) y de los modelos base encadenados.
- Dependencias: algunas optimizaciones (FP8, offload, LoRA) dependen de herramientas de terceros (DiffSynth-Studio, ComfyUI-WanVideoWrapper) cuyo mantenimiento no controla el autor.
- Repositorio de 72,5 GB: requiere planificacion de almacenamiento y ancho de banda para descarga e inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Wan-AI/Wan2.2-Animate-14B
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Paper (Wan: Open and Advanced Large-Scale Video Generative Models): https://arxiv.org/abs/2503.20314
- Repositorio GitHub: https://github.com/Wan-Video/Wan2.2
- Organizacion en HuggingFace: https://huggingface.co/Wan-AI/
- ModelScope: https://modelscope.cn/organization/Wan-AI
- Pagina del proyecto Animate: https://humanaigc.github.io/wan-animate
- Demo en HuggingFace Space: https://huggingface.co/spaces/Wan-AI/Wan2.2-Animate
- Demo en ModelScope Studio: https://www.modelscope.cn/studios/Wan-AI/Wan2.2-Animate
- Plataforma Wan: https://wan.video/
- Blog de Wan: https://wan.video/welcome
- Discord: https://discord.gg/AKNgpMK4Yj
- Guia de usuario (ingles): https://alidocs.dingtalk.com/i/nodes/EpGBa2Lm8aZxe5myC99MelA2WgN7R35y
- Guia de usuario (chino): https://alidocs.dingtalk.com/i/nodes/jb9Y4gmKWrx9eo4dCql9LlbYJGXn6lpz
- DiffSynth-Studio: https://github.com/modelscope/DiffSynth-Studio
- ComfyUI WanVideoWrapper (Kijai): https://github.com/kijai/ComfyUI-WanVideoWrapper
- Documentacion ComfyUI Wan2.2: https://docs.comfy.org/tutorials/video/wan/wan2_2
- Wan2.2-S2V-14B (variante speech-to-video): https://humanaigc.github.io/wan-s2v-webpage
