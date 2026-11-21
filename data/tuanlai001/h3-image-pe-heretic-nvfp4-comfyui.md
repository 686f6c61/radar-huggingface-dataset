# tuanlai001/H3-IMAGE-PE-HERETIC-NVFP4-COMFYUI

## Resumen

H3-IMAGE-PE-HERETIC-NVFP4-COMFYUI es una versión modificada ("uncensored" o *heretic*) del modelo de expansión de prompts (prompt enhancer, PE) asociado a MiniMax-H3-Image, un sistema de generación de imágenes texto-a-imagen. El modelo parte de Qwen/Qwen3.8-27B como base y ha sido afinado para reescribir y enriquecer prompts de usuario antes de pasarlos al generador de imágenes. Lo publica el usuario tuanlai001 en Hugging Face y está empaquetado como archivo único de difusión (diffusion-single-file) para cargarse mediante el nodo *CLIP Loader* de ComfyUI.

La relevancia de esta ficha radica en dos aspectos. Por un lado, es un ejemplo de la práctica de "abliteración" o eliminación de rechazos mediante la herramienta heretic, con un checkpoint seleccionado manualmente entre 1200 pruebas que reporta una tasa de rechazo del 10 % (10/100) y una divergencia KL de 0.1419 respecto al modelo original. Por otro, la licencia MiniMax-H3-Image Community License Agreement impone restricciones territoriales severas (excluye la Unión Europea, Reino Unido, Corea del Sur y Estados Unidos) y límites comerciales, lo que condiciona por completo su uso en producción.

El modelo está cuantizado en NVFP4 (formato de 4 bits de NVIDIA) y se distribuye en un repositorio de 17,9 GB. La información pública disponible es escasa: no se detallan parámetros activos, composición del dataset de entrenamiento ni resultados de benchmarks, por lo que muchos campos de esta ficha se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen/Qwen3.8-27B, según el campo `base_model`); detalles de la arquitectura interna no disponibles |
| Parámetros totales | No disponible (el modelo base declarado es Qwen3.8-27B, pero no se confirma que el tamaño final coincida) |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | NVFP4 (4 bits, formato de NVIDIA); el repositorio se distribuye en este formato |
| Idiomas soportados | Inglés (`en` en los tags); resto no disponible |
| Licencia | MiniMax-H3-Image Community License Agreement (`other`) |
| Formato de pesos | Archivo único compatible con el nodo CLIP Loader de ComfyUI (diffusion-single-file); cuantización NVFP4 |

## Arquitectura y entrenamiento

El modelo se presenta como una conversión de un *prompt enhancer* para MiniMax-H3-Image, construido sobre Qwen/Qwen3.8-27B según los metadatos de `base_model`. No se publican detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la fase original. La innovación técnica documentada es el proceso de *uncensoring* mediante la herramienta heretic (p-e-w/heretic), que elimina o atenúa los mecanismos de rechazo del modelo base.

El autor indica que el checkpoint final se seleccionó manualmente entre 1200 pruebas, con una tasa de rechazo medida del 10 % (10 de 100 prompts) y una divergencia KL de 0.1419 frente al modelo de referencia. Estos valores sugieren una modificación moderada de la distribución de salida: la KL no es despreciable, lo que implica que el modelo se desvía del original en una parte relevante de su espacio de respuestas, aunque no se especifica cómo se midieron ni con qué conjunto de evaluación. La cuantización a NVFP4 se aplica sobre los pesos para reducir el tamaño y facilitar la carga en ComfyUI, pero no se documenta la pérdida de calidad asociada.

## Capacidades

- Expansión de prompts: reescribe instrucciones breves o ambiguas en descripciones detalladas orientadas a generación de imágenes texto-a-imagen.
- Generación de texto en inglés, orientada a la producción de descripciones visuales.
- Integración con ComfyUI mediante el nodo CLIP Loader, lo que permite encadenarlo a pipelines de difusión.
- Comportamiento "uncensored": menor probabilidad de rechazar peticiones que el modelo base, según la tasa de rechazo reportada del 10 %.
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (solo se declara inglés).
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.

## Casos de uso

- Enriquecimiento automático de prompts en ComfyUI: el modelo se carga como CLIP en un flujo de trabajo de ComfyUI y transforma una frase corta del usuario en un prompt detallado con composición, iluminación y estilo, reduciendo la iteración manual.
- Prototipado de pipelines texto-a-imagen: útil para equipos que experimentan con MiniMax-H3-Image y necesitan un expansor de prompts que no bloquee peticiones creativas o de contenido adulto legítimo.
- Generación de descripciones para catálogos visuales: a partir de una etiqueta de producto se puede generar una descripción rica que alimente un generador de imágenes para *mockups* o material promocional.
- Investigación sobre alineación y censura: el modelo sirve como caso de estudio para medir el efecto de heretic sobre la tasa de rechazo y la divergencia KL en un modelo de 27B, con métricas reproducibles.
- Creación de contenido artístico sin restricciones temáticas: para estudios que necesitan explorar estilos o temáticas que los modelos alineados rechazan, dentro de los límites legales aplicables.
- Evaluación comparativa de cuantizaciones: al estar en NVFP4, permite medir en ComfyUI la degradación de calidad frente a versiones en BF16 o GGUF del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de evaluación reportado por el autor es la tasa de rechazo (10 %, 10/100) y la divergencia KL (0.1419) del proceso de *uncensoring*; no se aportan métricas de MMLU, HumanEval, GSM8K ni de calidad de expansión de prompts.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. El repositorio ocupa 17,9 GB en NVFP4, por lo que se necesita al menos esa cantidad de VRAM para cargar los pesos, más el *overhead* de activaciones y del pipeline de ComfyUI.
- GPU recomendadas: no disponibles en la documentación. Por el tamaño del archivo, se requiere una GPU con 24 GB o más (RTX 4090, RTX 3090, A100, H100) para una carga holgada.
- ¿Cabe en GPU de consumo? Previsiblemente en RTX 4090 (24 GB) y RTX 3090 (24 GB); no se confirma para GPUs de 16 GB o menos.
- Opciones de despliegue: ComfyUI mediante el nodo CLIP Loader; los tags mencionan sglang, aunque no se documenta la integración.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| H3-IMAGE-PE-HERETIC-NVFP4-COMFYUI | No disponible (base Qwen3.8-27B) | No disponible | NVFP4 | MiniMax-H3-Image Community (excluye UE, Reino Unido, Corea del Sur y EE. UU.) | Hugging Face, archivo único para ComfyUI |
| Prompt enhancer original de MiniMax-H3-Image | No disponible | No disponible | No disponible | MiniMax-H3-Image Community | Hugging Face (MiniMaxAI) |
| Qwen/Qwen3.8-27B (modelo base) | 27B (según denominación) | No disponible | Múltiples (no detalladas) | No disponible | Hugging Face (Qwen) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Restricción territorial severa: la licencia excluye explícitamente la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos, por lo que su uso en España no está cubierto por los términos del acuerdo.
- Uso comercial limitado: se requiere autorización previa por escrito de MiniMax si los ingresos anuales superan 1 millón de USD o si se ofrece como servicio alojado (Hosted Service).
- Redistribución condicionada: obliga a incluir copia del acuerdo, avisos destacados en archivos modificados y el texto NOTICE.
- Riesgo de alucinación: al ser un modelo de expansión de prompts, puede introducir elementos no solicitados en la descripción generada.
- Sesgos y contenido: el proceso de *uncensoring* reduce los rechazos, lo que incrementa el riesgo de generar contenido inapropiado o no alineado con políticas de moderación.
- Divergencia respecto al original: la KL de 0.1419 indica desviaciones medibles en la distribución de salida; no se documenta su impacto en la calidad de los prompts generados.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está verificado.
- Documentación incompleta: faltan datos de contexto, dataset de entrenamiento, benchmarks y requisitos de hardware oficiales.
- Nombre del repositorio engañoso: pese a los tags de "text-to-image", el modelo es un expansor de prompts, no un generador de imágenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tuanlai001/H3-IMAGE-PE-HERETIC-NVFP4-COMFYUI
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia MiniMax-H3-Image: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- Repositorio del modelo original MiniMax-H3-Image: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Herramienta heretic: https://github.com/p-e-w/heretic
