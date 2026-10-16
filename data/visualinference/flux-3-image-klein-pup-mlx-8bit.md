# VisualInference/FLUX-3-Image-Klein-pup-MLX-8bit

## Resumen

FLUX-3-Image-Klein-pup-MLX-8bit es una conversion comunitaria, cuantizada a 8 bits, del modelo Prompt Upsampler de FLUX 3 Image Klein desarrollado por Black Forest Labs. Se trata de un fine-tune de Qwen3.5 de aproximadamente 9.400 millones de parametros cuyo proposito no es generar imagenes, sino transformar peticiones breves, instrucciones de edicion o esquemas de cajas delimitadoras en descripciones textuales completas que el modelo generativo FLUX 3 Image Klein aprovecha mejor. La conversion la firma VisualInference y no esta afiliada ni respaldada por Black Forest Labs.

La relevancia de esta pieza reside en que resuelve el cuello de botella clasico del text-to-image profesional: los prompts cortos producen resultados pobres, mientras que escribir captions de 150-250 palabras a mano es costoso. Este upsampler acepta ademas hasta 10 imagenes de referencia y acepta entradas multimodales (imagen-texto-a-texto), lo que permite describir ediciones sobre una imagen existente o convertir un layout con cajas en una caption detallada.

Tecnicamente es una conversion MLX, pensada para Apple Silicon, con un peso en repositorio de 10,4 GB y unas necesidades de memoria de 11-12 GB en un M4 Pro. Se distribuye bajo licencia Apache 2.0. No hay resultados de benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (fine-tune de Qwen3.5, modelo vision-lenguaje) |
| Parametros totales | 9.409.813.744 (~9,4 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); el autor menciona tambien un upsampler en 4 bits en los ejemplos |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen3.5 orientado a la tarea de prompt upsampling, reconvertido a MLX mediante la herramienta mlx-vlm y cuantizado a 8 bits. Al heredar la naturaleza de Qwen3.5, se trata de un transformer multimodal capaz de procesar tanto texto como imagenes (pipeline image-text-to-text), lo que explica que acepte hasta 10 imagenes de referencia junto a la peticion textual. La funcion especifica para la que fue ajustado es convertir una instruccion corta, una orden de edicion o un layout con bounding boxes en una caption extensa y descriptiva.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO durante el ajuste. Tampoco se especifican innovaciones de decodificacion mas alla de la mencion generica "Decoding follows" que aparece truncada en la model card. La innovacion funcional destacable es el propio enfoque de upsampling: el modelo actua como preprocesador del pipeline generativo, ampliando la peticion del usuario antes de pasarla al modelo de imagen.

## Capacidades

- Generacion de texto descriptivo extenso a partir de peticiones breves (captions de 180-250 palabras en los ejemplos documentados).
- Conversion de instrucciones de edicion ("remove the parked car and its shadow") en descripciones detalladas que preservan el encuadre y los elementos a mantener.
- Interpretacion de layouts con cajas delimitadoras (bounding boxes) para generar captions espacialmente coherentes.
- Entrada multimodal: acepta hasta 10 imagenes de referencia ademas de la peticion textual (image-text-to-text).
- Descripcion tecnica de fotografia: en los ejemplos genera detalles de pelicula (Portra 400, CineStill 800T), iluminacion, profundidad de campo, grano y paleta cromatica.
- Soporte conversacional (etiqueta "conversational").
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitado a ingles segun la etiqueta de idioma del repositorio.

## Casos de uso

- Preprocesado de prompts en pipelines de text-to-image: el modelo toma una peticion de una linea y la expande a una caption detallada que alimenta a FLUX 3 Image Klein, mejorando la fidelidad del resultado sin que el usuario escriba el prompt completo.
- Automatizacion de edicion de imagen por instruccion: convierte ordenes cortas como "elimina el coche aparcado y su sombra" en instrucciones de edicion exhaustivas que indican que eliminar, que reconstruir y que preservar del encuadre original.
- Generacion de captions desde layouts: a partir de un esquema con bounding boxes, produce una descripcion espacialmente coherente util para equipos de diseno o produccion audiovisual.
- Documentacion y catalogacion de imagenes con referencias: al aceptar hasta 10 imagenes de referencia, puede generar descripciones consistentes de estilo para lotes de imagenes.
- Integracion en herramientas de creacion asistida: se puede invocar mediante la CLI `flux3-mlx` o desde Python, encajandolo en interfaces donde el usuario escribe de forma coloquial.
- Reproduccion de estilos fotograficos concretos: los ejemplos muestran que el modelo traduce referencias a peliculas analogicas (Kodak Portra, CineStill) en descripciones tecnicas utiles para el generador.
- Prototipado local en Apple Silicon: al ejecutarse en MLX sobre un M4 Pro con 11-12 GB de memoria, permite montar un flujo de upsampling sin depender de GPUs de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Unicamente se ofrecen metricas de rendimiento de inferencia en hardware local:

| Metrica | Valor |
|---|---|
| Velocidad de generacion | ~28 tok/s |
| Tiempo por prompt | 11-12 s |
| Memoria maxima (M4 Pro) | 11-12 GB |
| Tamano del repositorio | 10,4 GB |
| Tamano indicado por el autor | 9,8 GB |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 11-12 GB de pico segun el propio autor, medido en un M4 Pro.
- El modelo esta en formato MLX, por lo que requiere Apple Silicon (no funciona de forma nativa en GPUs NVIDIA).
- Cabe en hardware consumer de Apple Silicon; el M4 Pro esta confirmado como plataforma de referencia. No se especifican otros chips (M1, M2, M3, Max, Ultra).
- Opciones de despliegue documentadas: libreria MLX y el paquete `flux3-mlx`, instalable con `pip install "flux3-mlx[pup] @ git+https://github.com/felix-ab/flux3-mlx"`.
- Ejecucion mediante CLI: `flux3-mlx "a man walking with his dog, afternoon sun" --upsample 8bit`.
- vLLM, llama.cpp, Ollama o TGI: no disponibles para este formato en la informacion proporcionada.
- Latencia y throughput: aproximadamente 28 tokens por segundo y 11-12 segundos por prompt en M4 Pro.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| FLUX-3-Image-Klein-pup-MLX-8bit (este) | ~9,4 B | no disponible | MLX safetensors 8 bits | apache-2.0 | Conversion comunitaria para Apple Silicon |
| black-forest-labs/flux-3-image-klein-pup (base) | ~9 B segun el autor | no disponible | no disponible | no disponible | Fine-tune de Qwen3.5 de Black Forest Labs; modelo original sin cuantizar |
| FLUX-3-Image-Klein-MLX-8bit (modelo de imagen referenciado en los ejemplos) | no disponible | no disponible | MLX 8 bits | no disponible | Es el generador de imagenes al que alimenta este upsampler, no un upsampler |

No se dispone de otros modelos comparables (upsamplers de prompt) en la informacion proporcionada.

## Limitaciones y advertencias

- Es un conversor comunitario, no oficial: el propio autor indica que no esta afiliado ni respaldado por Black Forest Labs, por lo que no hay garantias de soporte ni mantenimiento.
- Cero descargas y cero likes en el momento de la ficha, lo que implica ausencia de validacion por parte de la comunidad.
- Solo soporta ingles; cualquier prompt en castellano u otro idioma queda fuera del ambito declarado.
- Esta atado al formato MLX y a Apple Silicon: no es desplegable en GPUs NVIDIA sin una conversion adicional.
- No hay datos de benchmarks, contexto maximo ni composicion de datos de entrenamiento, lo que dificulta evaluar su calidad de forma objetiva.
- Como todo modelo generativo de texto, puede alucinar detalles que no esten en la peticion original; en upsampling de imagenes esto puede traducirse en descripciones que inventen elementos no presentes.
- Riesgo de sesgo: no se documenta ninguna evaluacion de sesgos.
- La licencia Apache 2.0 permite uso comercial, pero esa cobertura aplica a esta conversion; conviene verificar la licencia del modelo base original por separado.
- No se documentan capacidades de tool calling ni de razonamiento multi-paso, por lo que no es adecuado como agente.
- La informacion de la model card aparece truncada ("Decoding follows"), de modo que algunos detalles de decodificacion quedan sin confirmar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VisualInference/FLUX-3-Image-Klein-pup-MLX-8bit
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup
- Modelo de imagen referenciado: https://huggingface.co/VisualInference/FLUX-3-Image-Klein-MLX-8bit
- Libreria de conversion mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Paquete flux3-mlx: https://github.com/felix-ab/flux3-mlx
