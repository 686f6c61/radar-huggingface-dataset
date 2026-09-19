# XGENlabs/XGEN-JING

## Resumen

XGEN-JING es un modelo de experiencia interactiva egocéntrica desarrollado por XGEN Labs (XGEN Team) que genera vídeo y audio en primera persona a partir de acciones, imágenes de referencia e historial de observación. Está construido sobre MiniMax-H3 (concretamente sobre la variante Ref2VA) y sobre el LoRA de destilación FlashGen de cuatro pasos, y se distribuye en formato Diffusers con pesos safetensors. El problema que resuelve es la simulación navegable de entornos: en lugar de generar vídeo pasivo desde un prompt, el modelo acepta control de cámara por teclado (w/s/a/d), instrucciones de interacción con objetos y diálogos de personajes, y produce vídeo y audio de forma conjunta.

La versión publicada, JING-Flash-v1, es un modelo bidireccional de cuatro pasos de inferencia. La model card declara explícitamente que el modelo causal y el informe técnico todavía no se han publicado, por lo que esta entrega debe considerarse una base funcional para experimentación más que un sistema de tiempo real en streaming. El repositorio ocupa 66,9 GB y arrastra dependencias de los pesos de MiniMax-H3 (codificador de texto, tokenizador, procesador, VAEs de vídeo y audio y schedulers) además del transformer propio.

Es relevante ahora porque combina tres piezas poco habituales en un mismo pipeline open weight: control de cámara explícito, condicionamiento por imágenes de referencia (hasta cinco, direccionables como `<Picture 1>`…`<Picture 5>`) y generación conjunta de audio y vídeo. La adopción es todavía muy temprana: 2 descargas y 37 likes en el momento de redactar esta ficha, con licencia de comunidad heredada de MiniMax-H3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con paralelismo de secuencia; codificador de texto y VAEs de vídeo y audio desacoplados |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados en el repositorio) |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | minimax-h3-community-license-agreement (etiquetada como `license: other`) |
| Formato de pesos | safetensors en formato Diffusers (carpeta `jing_flash_v1` para el transformer) |
| Modelo base | MiniMaxAI/MiniMax-H3 (refinamiento sobre MiniMax-H3 Ref2VA) y LoRA FlashGen |
| Pipeline | image-text-to-video (con salida de audio conjunta) |
| Pasos de inferencia | 4 pasos (bidireccional, JING-Flash-v1) |
| Tamano del repositorio | 66,9 GB |
| Fecha de publicacion | 16 de septiembre de 2026 (actualizado el 18 de septiembre de 2026) |

## Arquitectura y entrenamiento

La arquitectura es un DiT (Diffusion Transformer) que se ejecuta con paralelismo de secuencia sobre cuatro GPU, acompañado de un codificador de texto en una GPU separada y de los VAEs de vídeo y audio en otra. La inferencia completa validada por el equipo ocupa por tanto seis GPU H100. El backend de atención por defecto es FlashAttention-4, y el stack declarado incluye Torch 2.13.0+cu130, torchvision 0.28.0+cu130, Triton 3.7.1, FA4 4.0.0b26 y SGLang kernel 0.4.7+cu130, con un runtime SGLang fijado a un commit concreto. El modelo de difusión parte de MiniMax-H3 Ref2VA y se acelera con el LoRA de destilación FlashGen, que reduce la generación a cuatro pasos.

El condicionamiento es multimodal y secuencial: imágenes de referencia ordenadas (personaje, objeto, escena), una secuencia de prompts con repetición y una entrada de control por slice. El número de fotogramas se deriva del propio guion mediante la fórmula `num_frames = 17 * sum(repeat) + 5`, y cada slice de control admite combinaciones de teclas (`"w"`, `"w,a"`, `""`). No se han publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se detalla el mecanismo interno de fusión audio-vídeo más allá de que ambos se generan de forma conjunta. El modelo causal y el informe técnico están anunciados como pendientes.

## Capacidades

- Generación de vídeo en primera persona (egocéntrico) a partir de acciones e historial de observación.
- Generación conjunta de vídeo y audio en una misma pasada de inferencia.
- Control de cámara mediante teclado: `w` (avanzar), `s` (retroceder), `a` (izquierda), `d` (derecha), con posibilidad de combinar dos teclas en un mismo slice.
- Interacción con objetos y diálogo con personajes guiados por texto.
- Condicionamiento por imágenes de referencia de personaje, objeto y escena, hasta cinco imágenes, direccionables como `<Picture 1>` a `<Picture 5>`.
- Composición de experiencias: desde un mismo punto de partida se pueden explorar acciones distintas combinando referencias y prompts.
- Generación de casos de inferencia validados a partir de historias e imágenes mediante las "Prompt skills" publicadas en el repositorio.
- Soporte de dos idiomas en los prompts: inglés y chino.
- No se documenta soporte de tool calling, function calling ni orquestación de agentes multi-paso; el modelo es generativo audiovisual, no un LLM de propósito general.

## Casos de uso

- Previsualización de escenas en producción audiovisual: el equipo de guion puede componer un plano en primera persona con imágenes de referencia del personaje y la localización, y validar la continuidad antes de rodar.
- Prototipado de videojuegos en primera persona: con control de cámara por teclado y audio sincronizado, sirve para generar material de bloqueo y explorar variantes de una misma zona sin construir arte final.
- Simulación de entrenamiento para robótica o conducción: la vista egocéntrica con acciones discretas de desplazamiento permite sintetizar secuencias de observación con audio ambiental para probar políticas de navegación.
- Creación de experiencias interactivas narrativas: combinando referencias de personaje y prompts de diálogo, se generan conversaciones con locución y vídeo coherentes para demos de ficción interactiva.
- Generación de contenido para redes y campañas: a partir de una imagen de producto y una secuencia de prompts con movimiento, se produce un clip audiovisual con audio diegético.
- Investigación en modelos del mundo: la formulación acción-observación permite estudiar modelado predictivo de entornos y evaluar la coherencia temporal de la generación condicionada.
- Herramientas de accesibilidad y descripción de entornos: el mismo pipeline condicionado por referencias puede generar recorridos narrados y sonorizados de un espacio a partir de fotografías.
- Iteración rápida en preproducción de doblaje y sonido: al generarse audio y vídeo juntos, se pueden obtener versiones provisionales para decidir tono y ambiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (FVD, CLIP-score, IS, MOS de audio ni comparativas con otros modelos), y el informe técnico figura como pendiente. Como única referencia de rendimiento, se declara inferencia en cuatro pasos y una configuración validada de seis GPU H100.

## Requisitos de hardware

- Configuración validada por el autor: seis GPU H100, distribuidas en una GPU para el codificador de texto, una para los VAEs de vídeo y audio, y cuatro para el DiT con paralelismo de secuencia.
- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio pesa 66,9 GB y el demo funcional consume seis GPU de clase 80 GB.
- GPU recomendadas: H100 (configuración de referencia). No se documentan alternativas como A100, RTX 4090 o similares.
- Compatibilidad con GPU de consumo: no acreditada en la información disponible; el despliegue publicado no cabe en una GPU consumer.
- Opciones de despliegue: Diffusers (revisión fijada en `requirements.txt`), runtime SGLang en el commit `95140a7b0c9fc2f87a2a6cf6f6f0df8640a73174`, FlashAttention-4 como backend por defecto. No se publican soportes de llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión de vídeo.
- Entorno de software: Python 3.12, Torch 2.13.0+cu130, torchvision 0.28.0+cu130, Triton 3.7.1, FA4 4.0.0b26, SGLang kernel 0.4.7+cu130.
- Latencia y throughput: no disponibles. La reducción a cuatro pasos es la única optimización de velocidad declarada.
- Los pesos se descargan automáticamente en la primera ejecución y se reutilizan desde la caché de Hugging Face; se puede fijar la ubicación con `HF_HOME` o pasar rutas manuales mediante `model.h3` y `model.transformer`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XGEN-JING (JING-Flash-v1) | no disponible | no disponible | Texto, imágenes de referencia, control de acción, audio | minimax-h3-community-license-agreement | Pesos abiertos en Hugging Face (66,9 GB), 4 pasos |
| MiniMax-H3 Ref2VA (modelo base) | no disponible | no disponible | Referencia a vídeo y audio | licencia de comunidad de MiniMax-H3 | Pesos e implementación publicados por MiniMax |
| FlashGen (LoRA de destilación) | no disponible | no disponible | LoRA sobre MiniMax-H3 | no disponible | Adaptador de 4 pasos publicado en Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría. La comparación con otros modelos de generación de vídeo egocéntrico o de modelos del mundo no puede hacerse con la información proporcionada: no disponible.

## Limitaciones y advertencias

- Modelo causal no publicado: la entrega actual es bidireccional y de cuatro pasos, por lo que no está pensada para streaming ni para interacción en tiempo real con latencia baja.
- Ausencia total de benchmarks: no hay métricas publicadas de calidad de vídeo, sincronización audio-vídeo, coherencia temporal o fidelidad al control de cámara.
- Control de cámara limitado: solo cuatro grados de libertad discretos (avance, retroceso, izquierda, derecha) mediante teclas; no se documenta control de rotación, altura ni velocidad.
- Idiomas: únicamente inglés y chino en los prompts; no se declara soporte de castellano ni de otras lenguas.
- Dependencia de terceros: requiere los pesos y componentes de MiniMax-H3 y el LoRA FlashGen, con revisiones de Diffusers y SGLang fijadas, lo que complica la reproducibilidad y el mantenimiento a largo plazo.
- Licencia restrictiva: la licencia minimax-h3-community-license-agreement está etiquetada como `license: other`. Las condiciones exactas de uso comercial no se detallan en la información disponible y deben verificarse en el fichero LICENSE antes de cualquier despliegue en producción.
- Riesgo de alucinación visual: como modelo generativo de difusión, puede producir geometrías inconsistentes, objetos que aparecen o desaparecen y audio no diegético; no hay evaluación publicada de estos fallos.
- Sin cuantizaciones oficiales: al no publicarse pesos cuantizados, el coste de inferencia queda limitado al hardware de clase H100 descrito.
- Madurez temprana: 2 descargas y 37 likes, sin informe técnico, sin arXiv y con el modelo causal pendiente; el soporte de la comunidad y la validación independiente son mínimos.
- Límite de cinco imágenes de referencia por caso, con direccionamiento posicional explícito, lo que restringe la composición de escenas complejas.
- El número de fotogramas está acoplado a la estructura del prompt (`17 * sum(repeat) + 5`), de modo que cambios en la duración obligan a reestructurar el caso de entrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XGENlabs/XGEN-JING
- Carpeta del transformer JING-Flash-v1: https://huggingface.co/XGENlabs/XGEN-JING/tree/main/jing_flash_v1
- Repositorio GitHub: https://github.com/XGEN-Labs/XGEN-JING
- Configuración base: https://github.com/XGEN-Labs/XGEN-JING/blob/main/configs/base.yaml
- Prompt skills: https://github.com/XGEN-Labs/XGEN-JING/blob/main/prompt_skills/SKILL.md
- Ejemplo de caso (bakery): https://github.com/XGEN-Labs/XGEN-JING/blob/main/examples/bakery_greeting.json
- Galería: https://xgenlabs.ai/gallery.html
- Blog de investigación: https://xgenlabs.ai/research.html
- Vídeo de demostración: https://huggingface.co/XGENlabs/XGEN-JING/resolve/main/assets/xgen-jing-demo.mp4
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repositorio de MiniMax-H3: https://github.com/MiniMax-AI/MiniMax-H3
- LoRA FlashGen: https://huggingface.co/Beidouqixing/minimax-h3-4step-lora-flashgen
- Runtime SGLang (commit fijado): https://github.com/sgl-project/sglang/tree/95140a7b0c9fc2f87a2a6cf6f6f0df8640a73174
- Índice de wheels CUDA 13 para SGLang: https://sgl-project.github.io/whl/cu130/sglang-kernel/
- Informe técnico: anunciado como "coming soon", sin enlace disponible.
