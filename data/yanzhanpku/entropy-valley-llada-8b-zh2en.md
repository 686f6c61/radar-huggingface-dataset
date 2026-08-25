# YanZhanPKU/Entropy-Valley-LLaDA-8B-Zh2En

## Resumen

Entropy-Valley-LLaDA-8B-Zh2En es un adaptador LoRA publicado por el grupo de investigación YanZhanPKU que convierte el modelo base de difusión enmascarada LLaDA-8B-Base (de GSAI-ML) en un sistema de traducción automática del chino al inglés. El adaptador se entrena con 200.000 pares de frases del conjunto WMT19 zh-en y se combina con el método Entropy-Valley (EV), un selector de longitud de decodificación sin entrenamiento que permite a un modelo de difusión enmascarada decidir cuántos tokens objetivo generar antes de iniciar el proceso de denoising.

La relevancia de este modelo reside en que aborda un problema específico de los modelos de difusión para lenguaje: a diferencia de los modelos autorregresivos, no disponen de un token EOS que detenga la generación, por lo que la longitud de la secuencia objetivo debe fijarse a priori. Entropy-Valley resuelve esta limitación mediante una sonda de entropía que evalúa qué longitud de lienzo (canvas) es la más adecuada para cada frase fuente, y la ficha técnica muestra que cierra el 65,3 % de la brecha de rendimiento entre una fijación de longitud fija y un oráculo que conoce la longitud exacta de la referencia.

El modelo está publicado bajo la licencia llada-8b-base-license, con pesos en formato safetensors, y ha sido desarrollado para su uso con la librería PEFT (adaptadores LoRA). El adaptador se integra en el repositorio oficial Entropy-Valley, que incluye el código para reproducir la evaluación completa sobre WMT22.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre LLaDA-8B-Base (modelo de difusion enmascarada, transformer) |
| Parametros totales | 8.02B (modelo base) + adaptador LoRA (tamano del repo: 0.6 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado en bf16) |
| Idiomas soportados | chino (zh) e ingles (en), direccion zh→en |
| Licencia | llada-8b-base-license (ver https://huggingface.co/GSAI-ML/LLaDA-8B-Base) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo LLaDA-8B-Base, un modelo de difusion enmascarada entrenado desde cero con un pipeline de pre-entrenamiento y fine-tuning supervisado (SFT). LLaDA utiliza un proceso de enmascaramiento directo (forward masking) y un proceso de generación inversa, parametrizado por un transformer que predice los tokens enmascarados. A diferencia de los modelos autorregativos, no genera tokens secuencialmente, sino que llena un lienzo de tamaño fijo mediante un proceso iterativo de denoising.

El adaptador LoRA se entrena con 200. pares de frases del dataset WMT19 zh-en (configuración `enzh` con roles intercambiados), durante 3 épocas, en bf16 y con 8 GPU H20. La configuración del adaptador es `r=64`, `alpha=128`, `dropout=0.05`, aplicada a las proyecciones `q/k/v/o_proj` y `ff_proj/up_proj/ff_out`. El método Entropy-Valley (EV) es un componente de decodificación que no requiere entrenamiento adicional: evalúa la entropía media de las primeras `L-1` posiciones del lienzo para cada longitud candidata en la cuadrícula `R = {1.00, 1.10, 1.20, 1.30, 1.40}`, y selecciona la longitud que minimiza esa entropía. La decodificación se realiza con un horario MED (Masked Epsilon Decoding) de 32 pasos, truncando en el token EOS.

## Capacidades

- Traduccion automatica chino→ingles de alta calidad, evaluada en WMT22 con COMET-22 y sacreBLEU.
- Decodificacion con difusion enmascarada (masked diffusion) sobre un modelo de 8.02B parametros.
- Seleccion adaptativa de la longitud de salida mediante el metodo Entropy-Valley, sin necesidad de entrenar un modulo adicional.
- Soporte de decodificacion en multiples pasos (32 pasos de denoising) con truncamiento por token EOS.
- Integracion con la libreria PEFT y Transformers (modelo base con adaptador LoRA).
- Capacidad multilingue limitada: solo chino e ingles, en una unica direccion (zh→en).
- No se mencionan capacidades de tool calling, agentes, vision, audio ni razonamiento multi-step.

## Casos de uso

- Localizacion de software y sitios web: el modelo puede traducir textos de interfaz, documentacion y mensajes de error del chino al ingles con una calidad comparable a sistemas autoregresivos, gracias a la seleccion de longitud adaptativa que evita traducciones truncadas o alargadas en exceso.
- Traduccion de articulos cientificos y tecnicos: su entrenamiento con datos WMT19 y su capacidad para manejar frases largas (gracias al metodo EV) lo hace util para traducir resumenes y secciones de papers del chino al ingles.
- Atencion al cliente bilingue: en escenarios donde una empresa china necesita responder a clientes angloparlantes, el modelo puede integrarse en pipelines de traduccion automatica para gestionar consultas y respuestas con una latencia razonable (32 pasos de decodificacion).
- Subtitulado y transcripcion de contenido audiovisual: la traduccion de subtitulos o guiones de chino a ingles puede beneficiarse de la seleccion de longitud de EV, que evita subtitulos que no se ajustan al tiempo de visualizacion.
- Traduccion de contenido de redes sociales y foros: el modelo puede convertir publicaciones de redes sociales, comentarios o articulos de blogs del chino al ingles, manteniendo el contexto y la coherencia gracias a su ventana de contexto (aunque la longitud exacta no esta especificada).
- Investigacion en traduccion automatica con modelos de difusion: el adaptador y el metodo EV sirven como punto de partida para investigadores que quieren experimentar con decodificacion de difusion enmascarada en MT, ya que el codigo de evaluacion y decodificacion esta disponible en el repositorio GitHub.

## Benchmarks y rendimiento

La tabla siguiente recoge los resultados de la evaluacion en el conjunto de test WMT22 Zh→En (2.037 frases), con decodificacion MED de 32 pasos y media de tres entrenamientos independientes. Los resultados se presentan en la model card del autor.

| Metodo de longitud | COMET-22 | sacreBLEU |
|---|---|---|
| Fixed ratio 1.2 | 0.8266 | 23.65 |
| Entropy-Valley | 0.8431 | 25.28 |
| Length oracle † | 0.8519 | 27.93 |

† El length oracle decodifica con la longitud exacta de la referencia, un limite superior no desplegable. Entropy-Valley cierra el 65.3 % de la brecha entre el ratio fijo y el oracle.

No se han publicado otros benchmarks (MMLU, HumanEval, etc.) en la informacion disponible, ya que el modelo esta orientado exclusivamente a traduccion.

## Requisitos de hardware

- VRAM estimada: el modelo base LLaDA-8B-Base tiene 8.02B parametros; en bf16 ocupa aproximadamente 16 GB. El adaptador LoRA (0.6 GB) se integra en el modelo base tras el merge, por lo que la VRAM necesaria para inferencia es similar a la del modelo base.
- GPU recomendadas: se requiere una GPU con al menos 16 GB de VRAM para bf16 (por ejemplo, RTX 4090, A100 40GB, H100). El entrenamiento se realizo con 8 GPU H20, pero la inferencia puede hacerse con una sola GPU de alta gama.
- En consumer GPU: si se dispone de una RTX 4090 (24 GB) o similar, es posible ejecutar el modelo en bf16. Para GPUs con menos VRAM, seria necesario cuantizar, pero no se indican cuantizaciones disponibles.
- Opciones de despliegue: el modelo se usa con Transformers y PEFT, y el repositorio proporciona un pipeline de traduccion. No se mencionan soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no se especifican en la informacion disponible. El proceso de decodificacion requiere 32 pasos de denoising, lo que implica una latencia mayor que un modelo autorregativo de tamano similar.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento (WMT22 zh→en) | Licencia |
|---|---|---|---|---|---|
| Entropy-Valley-LLaDA-8B-Zh2En | Adaptador LoRA sobre LLaDA-8B-Base | 8.02B base + LoRA | no disponible | COMET-22 0.8431, BLEU 25.28 | llada-8b-base-license |
| LLaDA-8B-Base (modelo base) | Modelo de difusion enmascarada | 8.02B | no disponible | no evaluado para MT | llada-8b-base-license |
| LaDiT-LLaDA-8B-Zh2En | Adaptador LoRA (coleccion Entropy-Valley) | 8.02B base + LoRA | no disponible | no disponible | llada-8b-base-license |

La comparativa con otros modelos de traduccion zh→en (como NLLB-200 o M2M100) no esta disponible en la informacion proporcionada. No se incluyen datos de benchmarks externos.

## Limitaciones y advertencias

- El adaptador solo soporta traduccion chino→ingles; no funciona en la direccion inversa ni con otros idiomas.
- El metodo Entropy-Valley requiere conocer el token de enmascaramiento del modelo base (126336) y aplicar el prompt template especificado; un uso incorrecto puede producir resultados suboptimos.
- La licencia llada-8b-base-license restringe el uso comercial del modelo base; se debe revisar la licencia del modelo base antes de desplegar en produccion.
- El modelo puede alucinar contenido si la entrada es ambigua o el contexto es insuficiente, como cualquier modelo de lenguaje de este tamano.
- Los datos de entrenamiento (WMT19) pueden contener sesgos y errores de traduccion, que pueden heredarse en el modelo.
- No se ha evaluado el modelo en otros conjuntos de test distintos de WMT22; el rendimiento en dominios especializados (medico, legal, etc.) no esta garantizado.
- La decodificacion con 32 pasos de denoising es computacionalmente intensiva; para aplicaciones en tiempo real puede ser necesario reducir el numero de pasos o cuantizar, aunque no se documenta en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YanZhanPKU/Entropy-Valley-LLaDA-8B-Zh2En
- Coleccion Entropy-Valley: https://huggingface.co/collections/YanZhanPKU/entropy-valley
- Dataset de entrenamiento: https://huggingface.co/datasets/YanZhanPKU/Entropy-Valley-Datasets
- Paper (arXiv:2608.22274): https://arxiv.org/abs/2608.22274
- Codigo (GitHub): https://github.com/Entropy-Valley/Entropy-Valley
- Modelo base LLaDA-8B-Base: https://huggingface.co/GSAI-ML/LLaDA-8B-Base
- Paper LLaDA (arXiv:2502.09992): https://arxiv.org/abs/2502.09992
- Codigo LLaDA (GitHub): https://github.com/ML-GSAI/LLaDA
