# Uhvg856/MiniMax-H3-Person-Remover-LoRA

## Resumen

MiniMax-H3-Person-Remover-LoRA es un adaptador LoRA experimental para el modelo de difusión de vídeo MiniMax H3, concretamente para la variante Ref2VA (referencia a vídeo/audio). Lo desarrolla Akatz Labs y su función es eliminar una persona concreta de un vídeo y reconstruir el fondo de forma coherente, manteniendo el movimiento de cámara y la temporalidad original. Se publica bajo la licencia comunitaria de MiniMax H3 y se distribuye como archivo único de difusión (safetensors) para su uso en ComfyUI.

El adaptador no funciona de forma autónoma: requiere el modelo base H3 Ref2VA, un codificador de texto Qwen3VL 32B, los VAE de vídeo y audio de H3, y SAM 3.1 para la segmentación de la persona. El flujo de trabajo asociado (H3 Relay 2.0) combina SAM para enmascarar al sujeto, un primer fotograma limpio editado externamente y una generación por ventanas solapadas que reconstruye el fondo fotograma a fotograma.

Es relevante porque aborda una tarea de edición de vídeo difícil —el borrado de objetos con reconstrucción temporal consistente— dentro del ecosistema ComfyUI y sobre un modelo de vídeo reciente. El repositorio es muy pequeño (0,2 GB) y no registra descargas ni valoraciones, lo que indica que se trata de una publicación reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusión de vídeo MiniMax H3 Ref2VA |
| Parametros totales | no disponible (el adaptador LoRA se distribuye como archivo único de 0,2 GB; los parámetros del modelo base no se detallan) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el flujo de trabajo opera por ventanas de 22 fotogramas (longitudes válidas 17n + 5: 22, 39, 56, 73...) |
| Tipos de cuantizacion | el adaptador se distribuye en safetensors; el modelo base recomendado usa INT8 ConvRot (pruned) y el codificador de texto NVFP4 AWQ |
| Idiomas soportados | inglés (en) |
| Licencia | minimax-h3-community-license-agreement (other) |
| Formato de pesos | safetensors (diffusion-single-file) |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado sobre MiniMax H3 Ref2VA, un modelo de difusión de vídeo con condicionamiento por referencia que genera vídeo y audio. El pipeline declarado es video-to-video y la librería diffusion-single-file. El LoRA no incluye segmentación ni edición de imagen: esas funciones las aportan SAM 3.1 (máscara de la persona) y una edición externa del primer fotograma (referencia limpia). El flujo Relay 2.0 encadena ventanas solapadas, usando el fotograma de frontera generado como referencia de la siguiente ventana y arrastrando 18 fotogramas de historial de vídeo y audio; después elimina el solape y recorta el resultado al número de fotogramas de origen.

Según la model card, V1 se entrenó durante 2.000 pasos de optimización (el texto se corta en ese punto y no se detallan más hiperparámetros, composición del dataset ni uso de RLHF/DPO). El dataset de entrenamiento es akatz-ai/H3-Person-Remover-v1. La model card advierte explícitamente de que se trata de un adaptador experimental y de que la muestra contiene resultados exitosos seleccionados, no una evaluación sistemática de todas las entradas.

## Capacidades

- Eliminación de una persona seleccionada en un vídeo y reconstrucción del fondo circundante.
- Edición de vídeo a vídeo con preservación del movimiento de cámara y del ritmo temporal original.
- Generación por ventanas solapadas con reutilización del fotograma de frontera como referencia, lo que permite procesar clips más largos que una sola ventana.
- Integración con SAM 3.1 para el seguimiento y enmascarado del sujeto (la máscara se rellena en verde y se pasa como condicionamiento).
- Soporte de audio: el flujo conserva la pista original si se conecta la salida de audio de Get Video Components; el modelo base H3 también dispone de VAE de audio.
- Flujo de trabajo nativo en ComfyUI con nodos de revisión, precarga de ventanas y repetición (reroll) de secciones débiles.
- Capacidad multilingüe: no disponible; el modelo declara únicamente inglés.
- No realiza tool calling, function calling ni razonamiento multi-paso de agentes: es un adaptador de difusión de vídeo.

## Casos de uso

- Postproducción y limpieza de metraje: eliminar a un transeúnte o a un miembro del equipo que aparece en un plano y reconstruir el fondo, útil en vídeo corporativo, documental o publicidad con presupuesto limitado.
- Protección de privacidad en vídeos: borrar a personas identificables de grabaciones de vigilancia, eventos o material formativo antes de su publicación, usando SAM 3.1 para el seguimiento del sujeto.
- Creación de material de archivo reutilizable: retirar a una persona concreta de un clip para reutilizar el fondo en otro contexto narrativo manteniendo la iluminación y el movimiento de cámara originales.
- Edición de contenido para redes sociales: limpiar planos de creadores o marcas donde aparece personal no deseado, con procesado por ventanas de 22 fotogramas a 24 fps.
- Investigación en edición de vídeo generativa: servir de base para experimentos de inpainting temporal y evaluación de consistencia de fondo con el modelo H3 Ref2VA.
- Pruebas de concepto en ComfyUI: validar pipelines de segmentación más difusión de vídeo antes de invertir en infraestructura de producción, dado el carácter experimental del adaptador.
- Restauración de planos con elementos no deseados: reconstruir zonas ocluidas por una figura en material antiguo o de baja calidad, siempre con revisión manual de las ventanas generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El flujo Relay 2.0 se probó en una RTX 4090 con ComfyUI (commit 79be670e2d9be63e238785af307369d2b9039ed1), frontend 1.53.6 y PyTorch 2.11.0 + CUDA 12.8; la versión mínima de esquema es ComfyUI 0.37.0.
- La residencia completa en GPU superó los 24 GB; con offloading normal y las políticas de memoria incluidas se completó el render con los mismos ajustes.
- El repositorio del adaptador ocupa 0,2 GB, pero el despliegue real exige descargar por separado el modelo base H3 Ref2VA pruned INT8 ConvRot, el codificador de texto Qwen3VL 32B NVFP4 AWQ, los VAE de vídeo FP16 y audio FP32, y SAM 3.1 multiplex FP16.
- Opciones de despliegue: ComfyUI con soporte nativo de MiniMax H3 y SAM 3.1, más el toolkit H3 Relay 2.0 (github.com/akatz-ai/h3-relay). No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.
- Ajustes de partida recomendados: fuerza LoRA 1.0, ventana de 22 fotogramas, 12 pasos de muestreo, sampler er_sde con scheduler simple, CFG 1, sigma shift de vídeo/audio 12/3, semilla 904234, expansión de máscara de 5 píxeles y 24 fps. Vídeo de entrada con ancho y alto divisibles por 32.

## Comparativa con modelos similares

| Modelo | Tipo | Función | Contexto/ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Person-Remover-LoRA (este) | LoRA sobre difusión de vídeo H3 Ref2VA | Borrado de persona con reconstrucción de fondo | Ventanas de 22 fotogramas (17n + 5) | minimax-h3-community-license-agreement | Hugging Face, ComfyUI |
| MiniMax H3 Ref2VA (base) | Difusión de vídeo y audio con condicionamiento por referencia | Generación y edición de vídeo/audio | no disponible | licencia comunitaria MiniMax H3 | Comfy-Org/MiniMax-H3 |
| SAM 3.1 | Segmentación de vídeo | Enmascarado y seguimiento del sujeto | no disponible | no disponible en la información | Comfy-Org/sam3.1 |

No se dispone de datos de rendimiento comparativo con otros adaptadores de borrado de personas, por lo que la comparación se limita a función, licencia y disponibilidad.

## Limitaciones y advertencias

- Adaptador experimental: la propia model card indica que la muestra recoge resultados exitosos seleccionados y no constituye un benchmark de todas las entradas.
- Los detalles de fondo, el movimiento de cámara, las sombras y los cortes duros pueden cambiar respecto al vídeo original.
- No segmenta personas ni crea la referencia limpia inicial: depende de SAM 3.1 y de una edición externa del primer fotograma, lo que introduce errores acumulables en la cadena.
- Requiere vídeo a 24 fps con dimensiones divisibles por 32 y funciona mejor con planos cortos y continuos (unos cinco segundos de partida).
- El resultado limpio es silencioso por defecto; conservar el audio exige conectar manualmente la pista original, y no se demuestra fidelidad de audio generado ni eliminación de voz.
- Solo declara soporte de inglés en los metadatos.
- Licencia comunitaria de MiniMax H3: es necesario revisar el acuerdo antes de cualquier uso comercial, ya que no es una licencia de código abierto estándar.
- Sin descargas ni valoraciones registradas en el momento de la consulta, lo que reduce la evidencia de robustez en producción.
- Riesgo de alucinación visual: la reconstrucción del fondo es generativa y puede inventar texturas o geometrías incoherentes entre ventanas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Uhvg856/MiniMax-H3-Person-Remover-LoRA
- Pesos del LoRA: https://huggingface.co/akatz-ai/MiniMax-H3-Person-Remover-LoRA/resolve/main/H3-Person-Remover-V1.safetensors
- Dataset de entrenamiento: https://huggingface.co/datasets/akatz-ai/H3-Person-Remover-v1
- Modelo base: https://huggingface.co/Comfy-Org/MiniMax-H3
- Toolkit H3 Relay: https://github.com/akatz-ai/h3-relay
- Perfil del autor en X: https://x.com/akatz_ai
- SAM 3.1 en Comfy-Org: https://huggingface.co/Comfy-Org/sam3.1
