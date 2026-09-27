# ThakiCloud/Qwen-Image-2.1-FewStep-v0.1

## Resumen

Qwen-Image-2.1 FewStep v0.1 es un par de adaptadores LoRA (rango 64) desarrollados por ThakiCloud que se cargan sobre el modelo de generación de imágenes Qwen-Image-2.1 para reducir el coste de inferencia de 40 pasos a 8 o 5 pasos de muestreo. El modelo base combina un transformer de difusión (DiT) de flujo único de 7B parámetros con un text encoder Qwen3-VL-8B. Los adaptadores se destilan mediante una variante de DMD2 con simulación hacia atrás sobre el calendario sigma de despliegue, sin término GAN, y ocupan 335 MB cada uno.

La relevancia de la propuesta es doble. Por un lado, los adaptadores de 8 y 5 pasos superan al modelo base ejecutado a 40 pasos en PickScore (22,47 y 22,34 frente a 22,31), y baten a los adaptadores de PrunaAI en la misma cantidad de pasos en todos los conjuntos de prompts medidos. Por otro, el coste por imagen en una NVIDIA B200 cae de 3,69 s a 0,66 s (8 pasos, LoRA fusionada y `torch.compile`) y a 0,45 s (5 pasos), lo que supone entre 5,5x y 8,2x de aceleración.

Se trata de un adaptador de investigación, no de un modelo autónomo: hereda la licencia Qwen Research License (uso no comercial) y está entrenado y evaluado exclusivamente para texto-a-imagen a 1024x1024, sin verificar su comportamiento en las capacidades de edición de imágenes del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 64) sobre Qwen-Image-2.1: DiT de flujo único de 7B parámetros + text encoder Qwen3-VL-8B; destilación DMD2 |
| Parametros totales | Modelo base: 7B (DiT) + 8B (text encoder); adaptadores: 335 MB por fichero (rango 64 sobre `attn.to_q/k/v/to_out.0` + `img_mlp.gate_layer/proj/out` en los 32 bloques) |
| Longitud de contexto | No aplica (modelo texto-a-imagen); resolución de entrenamiento 1024x1024 |
| Tipos de cuantizacion | No disponible en la información proporcionada; los adaptadores se distribuyen en safetensors y el base se ejecuta en bf16 |
| Idiomas soportados | Prompts de entrenamiento y evaluación de renderizado de texto en inglés, coreano y chino (en/ko/zh); no se documentan capacidades multilingües adicionales |
| Licencia | Qwen Research License (no comercial), heredada del modelo base; `license: other` |
| Formato de pesos | safetensors (LoRA para diffusers): `qif_qwen_image_2.1_8step_v0.1.safetensors` y `qif_qwen_image_2.1_5step_v0.1.safetensors` |

## Arquitectura y entrenamiento

Los adaptadores no modifican la arquitectura del modelo base: se insertan como ramas LoRA de rango 64 sobre las proyecciones de atención (`attn.to_q`, `attn.to_k`, `attn.to_v`, `attn.to_out.0`) y sobre el MLP de imagen (`img_mlp.gate_layer`, `img_mlp.proj`, `img_mlp.out`) en los 32 bloques del DiT de Qwen-Image-2.1. El pipeline de diffusers permanece intacto; solo hay que sustituir el scheduler por un `FlowMatchEulerDiscreteScheduler` con `use_dynamic_shifting=False`, `shift=1.0` y `shift_terminal=None`, porque el adaptador ya incorpora su propia lista de sigmas y el desplazamiento dinámico se aplicaría dos veces. La inferencia se realiza sin CFG (`true_cfg_scale=1`) y sin prompt negativo.

El método de destilación es DMD2 (distribution matching distillation) con simulación hacia atrás sobre el calendario sigma de despliegue, actualizaciones de fake-score a dos escalas temporales y sin término GAN. Una copia congelada del modelo base sostiene dos ramas LoRA: el estudiante (el que se distribuye) y una puntuación falsa que sigue la distribución de salida del estudiante, mientras que el base sin LoRA actúa como puntuación real. Cada actualización del generador despliega el estudiante sobre el calendario sigma de despliegue durante un número aleatorio de pasos sin gradiente. El entrenamiento usó 1.200 actualizaciones del generador con batch global 4 a 1024x1024, y 33.000 prompts: prompts detallados estilo FLUX (licencia MIT), prompts cortos estilo Stable Diffusion y prompts sintéticos de renderizado de texto (en/ko/zh, el 8 % de los muestreos para el adaptador de 8 pasos). Los objetivos de entrenamiento son el propio modelo base, sin imágenes externas.

El calendario sigma de 8 pasos es el desplazamiento propio del scheduler base a 1024² (exp(μ)=2,0) aplicado sobre una rejilla uniforme, de modo que el adaptador coincide con lo que el base espera a esa resolución. La model card indica que la descripción del método está truncada en el punto en que se detalla el paso de despliegue del estudiante.

## Capacidades

- Generacion de imagenes texto-a-imagen a 1024x1024 con 8 o 5 pasos de muestreo, sin CFG ni prompt negativo.
- Renderizado de texto dentro de la imagen: 99 % de coincidencia exacta y 0,5 % / 0,1 % de CER en el conjunto de evaluación de 100 prompts en inglés, coreano y chino (con la salvedad de que parte de esos datos es in-distribution).
- Inferencia acelerada: 0,66 s por imagen (8 pasos, LoRA fusionada + `torch.compile`) y 0,45 s (5 pasos) en una NVIDIA B200 a 1024², batch 1 y bf16.
- Compatibilidad con el pipeline `QwenImage21Pipeline` de diffusers y con las claves de otros LoRA de Qwen-Image-2.1.
- Alineación prompt-imagen competitiva, aunque ligeramente inferior al base y a Pruna en CLIP-H (34,66 frente a 35,02 del base a 40 pasos).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de difusión, no un modelo de lenguaje.
- La edición de imágenes con hasta 10 referencias que ofrece Qwen-Image-2.1 no está verificada con estos adaptadores cargados.
- No se documentan capacidades de audio, vídeo ni visión de entrada.

## Casos de uso

- Generación de imágenes para catálogos de comercio electrónico: con 0,66 s por imagen a 1024² en B200 y licencia de investigación, sirve para prototipar pipelines de generación masiva de producto antes de decidir el modelo de producción definitivo o de negociar una licencia comercial.
- Renderizado de rótulos, carteles y packaging: el adaptador está entrenado específicamente con prompts de renderizado de texto en inglés, coreano y chino, y alcanza un 99 % de coincidencia exacta en la transcripción con Qwen3-VL-8B, lo que lo hace adecuado para mockups de señalética y etiquetas.
- Iteración interactiva en herramientas de diseño: los 0,45 s por imagen del adaptador de 5 pasos permiten un bucle de generación casi en tiempo real sobre una única GPU de datacenter, sin recurrir a recortes de resolución.
- Investigación académica en destilación de modelos de difusión: el repositorio publica dos adaptadores con el mismo layout de claves que otros LoRA de Qwen-Image-2.1, lo que facilita reproducir la comparación entre DMD2 con simulación hacia atrás y otras recetas few-step.
- Aumento de datos sintéticos para visión por computador: generación de conjuntos de imágenes con texto renderizado controlado (palabra, estilo, soporte) para entrenar o evaluar sistemas OCR, siempre dentro del ámbito no comercial de la licencia.
- Demostraciones y benchmarks internos de latencia: al ejecutarse sobre el pipeline estándar de diffusers y admitir `fuse_lora()` + `torch.compile`, se puede integrar en un arnés de medida para comparar schedulers, resoluciones y backends sin cambiar el modelo base.
- Generación de ilustraciones para documentación técnica o blogs de investigación: la ventana de 8 pasos reduce el coste de generar lotes de figuras, aunque el uso debe ceñirse a los términos de la Qwen Research License.

## Benchmarks y rendimiento

Evaluación sobre 500 prompts a 1024² con la misma semilla por prompt: PartiPrompts (200, estratificado), DrawBench (200) y renderizado de texto (100, en/ko/zh). PickScore y CLIP-H son medias sobre las 500 imágenes; OCR se mide sobre el subconjunto de renderizado de texto y cuenta como acierto cuando la cadena solicitada aparece en la transcripción de Qwen3-VL-8B.

| Modelo | Pasos | PickScore | CLIP-H | OCR exacto | OCR CER | Victorias PickScore vs Pruna (mismos pasos) |
|---|---|---|---|---|---|---|
| Qwen-Image-2.1 (receta oficial) | 40 | 22,31 | 35,02 | 95 % | 3,2 % | — |
| Qwen-Image-2.1, sin adaptador | 8 | 21,47 | 34,24 | 81 % | 9,6 % | 17 % |
| PrunaAI/Pruna-Qwen-Image-2.1 | 8 | 22,02 | 35,00 | 91 % | 4,4 % | — |
| Este repositorio, 8 pasos | 8 | 22,47 | 34,66 | 99 % | 0,5 % | 68 % |
| Qwen-Image-2.1, sin adaptador | 5 | 21,35 | 34,29 | 82 % | 10,2 % | 14 % |
| PrunaAI/Pruna-Qwen-Image-2.1 | 5 | 21,94 | 35,10 | 87 % | 6,2 % | — |
| Este repositorio, 5 pasos | 5 | 22,34 | 34,35 | 99 % | 0,1 % | 69 % |

Diferencias reportadas por el autor: 8 pasos frente a Pruna 8 pasos, PickScore +0,46 (IC bootstrap del 95 %: +0,38 a +0,53); 8 pasos frente al base de 40 pasos, PickScore +0,16 (IC +0,09 a +0,23) con una tasa de victoria por prompt del 59 %. Puntos débiles declarados: CLIP-H queda entre 0,3 y 0,8 por debajo de Pruna y del base; en PartiPrompts el adaptador de 8 pasos empata con Pruna (32,95 frente a 32,93) y la diferencia proviene de DrawBench y del subconjunto de texto.

Rendimiento temporal en una NVIDIA B200, 1024², batch 1, bf16, mediana de 20 ejecuciones tras el calentamiento, incluyendo codificación de texto y decodificación VAE:

| Configuracion | s / imagen | vs 40 pasos |
|---|---|---|
| Qwen-Image-2.1, 40 pasos (KV cache activada) | 3,69 | 1,0x |
| 8 pasos, LoRA sin fusionar | 0,92 | 4,0x |
| 8 pasos, LoRA fusionada | 0,82 | 4,5x |
| 8 pasos, LoRA fusionada + `torch.compile` | 0,66 | 5,5x |
| 5 pasos, LoRA sin fusionar | 0,62 | 5,9x |
| 5 pasos, LoRA fusionada | 0,56 | 6,6x |
| 5 pasos, LoRA fusionada + `torch.compile` | 0,45 | 8,2x |

Sin fusionar, los adaptadores corren a la misma velocidad que los de Pruna (0,94 s y 0,64 s en el mismo arnés); la ganancia adicional proviene de `fuse_lora()` y `torch.compile`, aplicables a cualquier LoRA.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia aritmética, los 7B parámetros del DiT más los 8B del text encoder en bf16 ocupan en torno a 30 GB de pesos, más activaciones y el coste del VAE; conviene tratarlo como estimación derivada del conteo de parámetros, no como una medida del repositorio.
- GPU recomendadas: la medición oficial se hizo en una NVIDIA B200. Para producción con margen de memoria son razonables H100 (80 GB) y A100 (80 GB); una A100 de 40 GB queda ajustada.
- GPU de consumo: una RTX 4090 de 24 GB no puede alojar los ~30 GB de pesos en bf16 sin cuantización o descarga selectiva a CPU/RAM, aunque el adaptador en sí solo añade 335 MB.
- Opciones de despliegue: el único camino documentado es `diffusers` con `QwenImage21Pipeline`. Se puede además fusionar el LoRA (`pipe.fuse_lora()`) y compilar el transformer con `torch.compile`. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, ya que se trata de un modelo de difusión y no de un LLM.
- Latencia y throughput conocidos: 0,66 s por imagen con el adaptador de 8 pasos (fusión + compilación) y 0,45 s con el de 5 pasos, ambos en B200 a 1024², batch 1 y bf16. No se publican cifras para otras GPU ni para batch mayor que 1.
- Restricción operativa: el scheduler debe configurarse con `use_dynamic_shifting=False`, `shift=1.0` y `shift_terminal=None`; en caso contrario, el desplazamiento se aplica dos veces y la calidad se degrada.

## Comparativa con modelos similares

| Modelo | Tamano | Pasos | PickScore | OCR exacto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este repositorio (8 pasos) | LoRA r=64 / 335 MB sobre Qwen-Image-2.1 (7B DiT + 8B encoder) | 8 | 22,47 | 99 % | Qwen Research (no comercial) | HuggingFace, diffusers |
| Este repositorio (5 pasos) | LoRA r=64 / 335 MB sobre Qwen-Image-2.1 | 5 | 22,34 | 99 % | Qwen Research (no comercial) | HuggingFace, diffusers |
| PrunaAI/Pruna-Qwen-Image-2.1 | Adaptador few-step sobre Qwen-Image-2.1 | 5 y 8 | 21,94 / 22,02 | 87 % / 91 % | No disponible en la información proporcionada | HuggingFace |
| Qwen-Image-2.1 sin adaptador | 7B DiT + 8B encoder | 40 | 22,31 | 95 % | Qwen Research (no comercial) | HuggingFace |
| Qwen-Image-2.1 sin adaptador | 7B DiT + 8B encoder | 5 y 8 | 21,35 / 21,47 | 82 % / 81 % | Qwen Research (no comercial) | HuggingFace |

La ventaja de este adaptador frente a Pruna se concentra en PickScore y en la exactitud de OCR; la desventaja, en CLIP-H (alineación prompt-imagen), donde queda 0,3-0,8 puntos por debajo. El autor advierte que PickScore premia el mayor contraste que tiende a producir DMD, por lo que ambas columnas deben leerse de forma conjunta. No se dispone de comparaciones con otras familias de modelos de imagen few-step en la información proporcionada.

## Limitaciones y advertencias

- Licencia Qwen Research License (no comercial), heredada del modelo base. Cualquier uso comercial requiere negociar una licencia aparte con los titulares de Qwen-Image-2.1.
- Solo texto-a-imagen: los adaptadores se entrenaron y evaluaron exclusivamente en T2I. La calidad de edición de imágenes (hasta 10 referencias en el base) no está verificada y puede degradarse al cargar el LoRA.
- Parte de las métricas de OCR son in-distribution: los 100 prompts de evaluación de renderizado de texto son combinaciones retenidas de soporte, estilo y palabra, pero comparten plantillas y vocabulario con los prompts de entrenamiento. El propio autor señala LongText-Bench como la siguiente medición pendiente.
- CLIP-H inferior al base de 40 pasos (34,66 frente a 35,02 en el adaptador de 8 pasos) y a Pruna: la alineación prompt-imagen es el punto flojo declarado.
- Entrenado únicamente a 1024x1024; no hay validación a otras resoluciones ni a otras relaciones de aspecto.
- Requiere inferencia sin CFG (`true_cfg_scale=1`) y sin prompt negativo, y obliga a reconfigurar el scheduler para desactivar el desplazamiento dinámico.
- Repositorio sin tracción comunitaria en el momento de la consulta: 0 descargas y 0 likes, por lo que no existen validaciones independientes de las cifras publicadas.
- No hay datos publicados sobre sesgos demográficos, culturales o de representación, ni sobre tasas de alucinación visual (elementos inexistentes en el prompt).
- Todos los benchmarks son internos del autor y usan un arnés propio; las comparaciones con PrunaAI provienen de la misma fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThakiCloud/Qwen-Image-2.1-FewStep-v0.1
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Adaptadores comparados de PrunaAI: https://huggingface.co/PrunaAI/Pruna-Qwen-Image-2.1
- Tarjeta en coreano: https://huggingface.co/ThakiCloud/Qwen-Image-2.1-FewStep-v0.1/blob/main/MODEL_CARD.ko.md
- Licencia: https://huggingface.co/ThakiCloud/Qwen-Image-2.1-FewStep-v0.1/blob/main/LICENSE
- Fichero de pesos 8 pasos: https://huggingface.co/ThakiCloud/Qwen-Image-2.1-FewStep-v0.1/blob/main/qif_qwen_image_2.1_8step_v0.1.safetensors
- Fichero de pesos 5 pasos: https://huggingface.co/ThakiCloud/Qwen-Image-2.1-FewStep-v0.1/blob/main/qif_qwen_image_2.1_5step_v0.1.safetensors
- Librería diffusers: https://github.com/huggingface/diffusers
- Paper de DMD2 (referencia del método de destilación): no disponible en la información proporcionada
