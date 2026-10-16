# VisualInference/FLUX-3-Image-Klein-pup-MLX-4bit

## Resumen

FLUX-3-Image-Klein-pup-MLX-4bit es una conversion comunitaria del modelo FLUX 3 Image Klein Prompt Upsampler de Black Forest Labs, publicada por el usuario VisualInference. No se trata de un generador de imagenes, sino de un "prompt upsampler": un modelo multimodal de 9.409.813.744 parametros (fine-tune de Qwen3.5, segun la model card) que convierte una peticion breve, una instruccion de edicion o un layout de cajas delimitadoras (bounding boxes), junto con hasta 10 imagenes de referencia, en el caption totalmente descrito que el generador FLUX 3 Image Klein necesita para obtener buenos resultados.

Su relevancia es practica: la calidad de los modelos de difusion depende en gran medida de la riqueza del prompt, y escribir captions de 180-250 palabras con detalle de iluminacion, optica, material y composicion es costoso para un usuario humano. Este upsampler automatiza esa fase. La conversion se ha realizado con mlx-vlm y se ha cuantizado a 4 bits, lo que reduce el peso a 5,6 GB y permite ejecutarlo en Apple Silicon con un pico de memoria de 7,0-7,5 GB (medido en un M4 Pro), a unos 50 tokens por segundo y 8-10 segundos por prompt.

El modelo esta publicado bajo licencia Apache-2.0 y solo soporta ingles. Es un artefacto independiente, no afiliado ni respaldado por Black Forest Labs, con 0 descargas y 0 "likes" en el momento de la consulta, por lo que su validacion por parte de la comunidad es todavia nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 (modelo base: black-forest-labs/flux-3-image-klein-pup) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no se indica que sea MoE en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX); el autor usa `--upsample 4bit` |
| Idiomas soportados | Ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria mlx); repositorio de 6,0 GB, pesos de 5,6 GB |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base es un fine-tune de Qwen3.5 de 9B desarrollado por Black Forest Labs, especializado en "prompt upsampling". La arquitectura concreta (dense o MoE, tipo de atencion, mecanismo de vision para las imagenes de referencia) no se detalla en la model card; la etiqueta `qwen3_5` y el pipeline `image-text-to-text` confirman que se trata de un modelo multimodal de entrada (texto e imagen) y salida de texto.

El proceso aplicado en este repositorio es una conversion, no un entrenamiento: VisualInference ha convertido los pesos originales con mlx-vlm y los ha cuantizado a 4 bits para ejecucion en Apple Silicon mediante MLX. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. La model card menciona que la decodificacion sigue alguna estrategia concreta, pero el texto esta truncado en el punto "Decoding follows", por lo que ese detalle no esta disponible.

## Capacidades

- Expansion de prompts: convierte una peticion corta (por ejemplo, "a halved pomegranate on a plaster plinth, hard window light, Portra 400") en un caption completo de 180-250 palabras con descripcion de sujeto, iluminacion, materiales, optica, composicion y grano de pelicula.
- Interpretacion de instrucciones de edicion: recibe una orden breve como "remove the parked car and its shadow" y produce una descripcion de edicion que preserva la composicion original y detalla que elementos eliminar y como reconstruir la zona afectada.
- Conversion de layouts a caption: acepta un layout de cajas delimitadoras como entrada para describir la composicion espacial.
- Entrada multimodal con imagenes de referencia: admite hasta 10 imagenes de referencia junto al texto.
- Generacion de texto conversacional (etiqueta `conversational` en el repositorio).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles.
- Generacion de imagenes: no. El modelo produce texto; la imagen la renderiza un modelo aparte (FLUX-3-Image-Klein-MLX-8bit en los ejemplos del autor).

## Casos de uso

- Preprocesado de prompts en pipelines de text-to-image: colocar el upsampler delante de FLUX 3 Image Klein para transformar prompts telegraficos de usuario final en captions detallados. El autor reporta de 8 a 10 segundos por prompt, un coste asumible frente a la mejora de fidelidad del resultado.
- Edicion de imagenes por instruccion breve: el usuario escribe "quita el coche aparcado" y el modelo genera la descripcion de edicion que el generador necesita, incluyendo la reconstruccion del fondo y la preservacion del resto de elementos.
- Control de composicion mediante bounding boxes: en flujos de diseno grafico o maquetacion donde el layout se define primero y el contenido despues, el modelo traduce el layout a un caption coherente.
- Reproduccion de estilos fotograficos concretos: los ejemplos de la model card demuestran que el modelo conoce y describe caracteristicas de emulsiones como Kodak Portra 400 o CineStill 800T (respuesta de color, grano, dominantes de sombra), util para equipos que necesitan consistencia visual entre imagenes.
- Generacion de storyboards y previsualizacion: estudio o agencia que trabaja en local sobre un Mac con Apple Silicon puede encadenar upsampler y generador sin enviar material a servicios en la nube.
- Procesamiento por lotes de catalogos de producto: a partir de una ficha breve de producto, generar captions fotograficos detallados y homogeneos para cientos de referencias, con el consiguiente ahorro de trabajo manual de redaccion de prompts.
- Investigacion sobre prompt engineering automatizado: permite estudiar de forma reproducible como varia la calidad de la imagen generada en funcion del nivel de detalle del caption intermedio.
- Asistencia creativa local con privacidad: al ejecutarse en memoria unificada de un equipo personal (7,0-7,5 GB de pico), es viable en entornos donde no se pueden usar APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de metricas de calidad de imagen (FID, CLIP score) para este modelo.

Las unicas cifras publicadas por el autor son de rendimiento en inferencia, no de calidad:

| Metrica | Valor | Condiciones |
|---|---|---|
| Velocidad de generacion | ~50 tok/s | M4 Pro |
| Latencia por prompt | 8-10 s | M4 Pro |
| Memoria maxima | 7,0-7,5 GB | M4 Pro |
| Tamano de pesos | 5,6 GB | Cuantizacion 4 bits |

## Requisitos de hardware

- VRAM/unified memory estimada: 7,0-7,5 GB de pico segun el autor, con pesos de 5,6 GB. Al ser MLX, consume memoria unificada, no VRAM dedicada.
- Hardware validado: Apple M4 Pro (unico chip con mediciones publicadas). Otros chips de la familia M no estan confirmados en la informacion disponible.
- GPU Nvidia (A100, H100, RTX 4090): no hay soporte declarado. La libreria es mlx, especifica de Apple Silicon.
- Cabe en equipo de consumo: si, en Mac con Apple Silicon; la cifra de 7,0-7,5 GB de pico lo situa al alcance de configuraciones de 16 GB de memoria unificada o superiores, aunque no se especifica el minimo oficial.
- Opciones de despliegue: CLI `flux3-mlx` (instalacion con `pip install "flux3-mlx[pup] @ git+https://github.com/felix-ab/flux3-mlx"`), ejecucion con `flux3-mlx "<prompt>" --upsample 4bit`. La conversion se realizo con mlx-vlm. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~50 tok/s y 8-10 s por prompt en M4 Pro.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el modelo base y con el generador de imagen citado en los ejemplos. Los datos de rendimiento y contexto de esos modelos no estan publicados en la informacion proporcionada.

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| VisualInference/FLUX-3-Image-Klein-pup-MLX-4bit | 9.409.813.744 | no disponible | Upsampling de prompts (texto e imagen de entrada, texto de salida) | apache-2.0 | safetensors MLX 4 bits |
| black-forest-labs/flux-3-image-klein-pup (modelo base) | no disponible (descrito como 9B en la model card) | no disponible | Upsampling de prompts | no disponible | no disponible |
| VisualInference/FLUX-3-Image-Klein-MLX-8bit | no disponible | no disponible | Generacion de imagen (no es comparable en tarea) | no disponible | MLX 8 bits |

No se dispone de informacion sobre otros upsamplers de prompts comparables.

## Limitaciones y advertencias

- Solo soporta ingles. Cualquier prompt en castellano u otro idioma queda fuera del alcance declarado.
- No genera imagenes: es un modelo de texto. Confundirlo con un generador llevaria a un pipeline incompleto.
- Riesgo de anadir detalle no solicitado. Los ejemplos de la propia model card lo evidencian: ante "night bus stop in the rain, CineStill 800T, one woman waiting under a red umbrella", el caption resultante especifica que la mujer es "an East Asian woman in her thirties", con abrigo de lana oscuro y bufanda crema, y anade un cartel que "reads 'BUS STOP' in white uppercase letters". Ninguno de esos elementos estaba en la peticion original, de modo que el upsampler sesga la generacion con decisiones que el usuario no tomo.
- Perdida de calidad por cuantizacion: los pesos estan reducidos a 4 bits, lo que puede degradar la fidelidad del caption respecto al modelo original.
- Modelo comunitario: es una conversion independiente, no afiliada ni respaldada por Black Forest Labs, y con 0 descargas y 0 "likes", por lo que carece de validacion externa.
- Informacion incompleta: la model card esta truncada ("Decoding follows"), y no se documentan la longitud de contexto, la estrategia de decodificacion, el dataset de entrenamiento ni los minimos de memoria oficiales.
- Restricciones de plataforma: la libreria MLX limita la ejecucion a Apple Silicon. No hay ruta declarada para CUDA.
- Licencia: el repositorio declara apache-2.0, lo que en principio permite uso comercial, pero no se dispone de los terminos del modelo base de Black Forest Labs, que conviene verificar antes de un despliegue en produccion.
- Metrica de memoria medida en un unico chip (M4 Pro). El comportamiento en otros equipos puede diferir.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VisualInference/FLUX-3-Image-Klein-pup-MLX-4bit
- Modelo base (Black Forest Labs): https://huggingface.co/black-forest-labs/flux-3-image-klein-pup
- Repositorio de la herramienta flux3-mlx: https://github.com/felix-ab/flux3-mlx
- mlx-vlm, libreria de conversion: https://github.com/Blaizzy/mlx-vlm
- Generador de imagen usado en los ejemplos: https://huggingface.co/VisualInference/FLUX-3-Image-Klein-MLX-8bit
