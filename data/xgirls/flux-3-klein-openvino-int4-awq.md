# xgirls/flux-3-klein-openvino-int4-awq

## Resumen

xgirls/flux-3-klein-openvino-int4-awq es una conversion de pesos a OpenVINO del transformer del modelo de generacion de imagenes FLUX.3 Klein de Black Forest Labs. No se trata de un modelo entrenado desde cero, sino de una compresion del transformer de difusion a precision mixta INT4/INT8, distribuida como un unico fichero OpenVINO IR junto a un adaptador de inferencia probado. El resto de componentes de la pipeline (codificador de texto Qwen3-VL, tokenizer, VAE y scheduler) se cargan desde el modelo original, que esta restringido por licencia y requiere acceso aprobado por Black Forest Labs.

El modelo base, FLUX.3 Image Klein, es un modelo de texto a imagen de 5,6 mil millones de parametros publicado con pesos abiertos. Segun la documentacion de Black Forest Labs, soporta generacion a partir de texto, edicion con hasta 10 imagenes de referencia y control de composicion mediante cajas delimitadoras. Esta conversion concreta solo exporta las entradas de texto a imagen: las entradas de edicion con imagen de referencia no estan incluidas en este IR y el adaptador las rechaza.

La relevancia de este repositorio es practica: reduce el transformer de 9,1 GB en BF16 a 2,83 GB en precision mixta, un 71 % menos, manteniendo una similitud coseno de 0,969 frente a BF16 en una entrada de calibracion fija. Esto lo hace candidato para despliegue en equipos CPU mediante el runtime de OpenVINO, aunque la generacion end-to-end de una imagen de 1024x1024 en 16 pasos medida por el autor tarda 455,7 segundos con el transformer en CPU. Se trata, en palabras del propio autor, de una conversion experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) del modelo base FLUX.3 Klein; este repo contiene unicamente la conversion OpenVINO del transformer |
| Parametros totales | 5,6 mil millones (modelo base FLUX 3 Image Klein). No se especifica el desglose por componente del transformer |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de imagen; el codificador de texto es Qwen3-VL, sin especificar su ventana) |
| Tipos de cuantizacion | INT4 simetrico (90 % de las capas, group size 64) e INT8 simetrico (10 %); tambien disponible el IR BF16 de referencia |
| Idiomas soportados | No disponible (los prompts se procesan mediante el codificador de texto Qwen3-VL del modelo base, pero no se declara cobertura de idiomas) |
| Licencia | flux-kommunity-license-v1.0 (campo `other` en Hugging Face) |
| Formato de pesos | OpenVINO IR (no safetensors ni GGUF); solo el transformer comprimido, cargable con `openvino.Core().read_model()` |
| Tamano del repositorio | 2,8 GB |
| Peso del IR comprimido | 2,83 GB (frente a 9,1 GB del IR BF16) |
| Libreria declarada | Diffusers |

## Arquitectura y entrenamiento

El modelo subyacente, FLUX.3 Image Klein, es un transformer de difusion de 5,6 mil millones de parametros de Black Forest Labs. Segun la informacion publica de BFL, integra en un mismo modelo generacion texto a imagen, edicion con hasta 10 imagenes de referencia y control de composicion por cajas delimitadoras. Este repositorio no entrena nada: reproduce el transformer del modelo base y lo somete a un proceso de compresion de pesos. La pipeline completa emplea un codificador de texto Qwen3-VL, un VAE y un scheduler que se cargan desde el modelo original restringido y se ejecutan mediante Diffusers.

La conversion se realizo con NNCF 3.4.0 sobre el modelo BF16 de Diffusers, exportado con longitudes dinamicas de tokens de imagen y texto. La receta aplica `INT4_SYM` con `ratio=0.9`, `group_size=64` y `AWQ=True`, con respaldo `INT8_SYM` para el 10 % restante asignado por precision mixta. La calibracion AWQ uso ocho entradas reales del transformer, correspondientes a dos etapas de eliminacion de ruido para cada uno de cuatro prompts. No se declara ningun tipo de ajuste fino, RLHF ni DPO sobre el modelo base en la informacion disponible.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) en resoluciones como 1024x1024, con 16 pasos de eliminacion de ruido en el ejemplo de validacion.
- Ejecucion del transformer sobre el plugin CPU de OpenVINO, con el codificador de texto y el VAE nativos en CUDA o CPU.
- Carga directa del IR como modelo OpenVINO y ejecucion a traves del adaptador `infer.py` incluido en el repositorio.
- Capacidades del modelo base declaradas por Black Forest Labs: edicion con hasta 10 imagenes de referencia y control de composicion con cajas delimitadoras. Estas capacidades no estan exportadas en este IR y el adaptador las rechaza.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, audio ni vision de entrada mas alla de lo anterior.

## Casos de uso

- Despliegue de generacion de imagenes en CPU sin GPU dedicada: el transformer en INT4/INT8 ocupa 2,83 GB y puede ejecutarse con el runtime de OpenVINO en el plugin CPU, lo que permite servir texto a imagen en servidores sin acelerador grafico.
- Prototipado de pipelines de difusion en entornos Intel: util para validar una pipeline de texto a imagen con OpenVINO antes de decidir un despliegue a mayor escala.
- Investigacion sobre cuantizacion de transformers de difusion: el repositorio documenta la receta exacta (INT4_SYM, group_size 64, AWQ con 8 entradas) y las metricas de fidelidad frente a BF16, lo que sirve de referencia reproducible.
- Integracion en estudios de imagen locales: el ecosistema del autor (proyecto Fern) apunta a ejecucion local con un unico modelo y un dispositivo OpenVINO especifico por hardware, de modo que este IR encaja en ese tipo de herramienta de escritorio.
- Generacion por lotes de baja prioridad en hardware modesto: la latencia elevada lo hace apto para tareas no interactivas donde el coste por imagen importa mas que el tiempo de respuesta.
- Evaluacion comparativa de calidad de cuantizacion: las metricas de similitud coseno y error RMS permiten estudiar el impacto de INT4 sobre detalle fino y contraste frente al modelo BF16.
- Educacion y demostraciones: al ser una conversion ligera y reproducible, sirve para ilustrar como se comprime y ejecuta un transformer de difusion con OpenVINO y NNCF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar de generacion de imagenes (por ejemplo, FID, CLIPScore o evaluaciones humanas) en la informacion disponible. El autor advierte que el error reportado del transformer es una comparacion de una sola entrada y no un benchmark amplio de calidad.

| Metrica | Valor | Condiciones |
|---|---|---|
| Similitud coseno vs BF16 | 0,969 | Una entrada de calibracion fija |
| Error RMS relativo vs BF16 | 0,249 | Una entrada de calibracion fija |
| Tamano del IR BF16 | 9,1 GB | Transformer |
| Tamano del IR INT4/INT8 | 2,83 GB | Reduccion aproximada del 71 % |
| Generacion end-to-end 1024x1024, 16 pasos | 455,7 s | Host Lambda con A100, transformer en OpenVINO CPU y componentes nativos en CUDA |

Ademas, Black Forest Labs afirma que en evaluaciones internas FLUX 3 Image Klein ocupa el primer puesto en texto a imagen, generacion multi-referencia y edicion de imagen, por delante de modelos abiertos de mayor tamano y de los modelos cerrados comparados (Ideogram V4.5 y FLUX.2 [pro]). Se trata de evaluaciones internas del fabricante, no de resultados verificados de forma independiente en la informacion disponible, y corresponden al modelo base, no a esta conversion cuantizada.

## Requisitos de hardware

- VRAM para la cuantizacion INT4/INT8: el transformer ocupa 2,83 GB en disco; la memoria en ejecucion depende del backend, pero Black Forest Labs indica soporte para GPU de 8 GB en el modelo base.
- VRAM para BF16: 9,1 GB solo para el transformer, mas el codificador de texto Qwen3-VL y el VAE.
- GPU recomendadas: una A100 se uso en el entorno de validacion, aunque con el transformer en CPU. Para los componentes nativos se recomienda una GPU CUDA; el autor indica que tambien pueden ejecutarse en CPU con una generacion mucho mas lenta.
- Compatibilidad con GPU de consumo: el modelo base declara soporte para GPU de 8 GB, por lo que es plausible en tarjetas como la RTX 3060 de 12 GB o superiores, aunque la informacion proporcionada no confirma pruebas especificas.
- Opciones de despliegue: runtime de OpenVINO (plugin CPU por defecto, `--ov-device` configurable), OpenVINO GenAI, Diffusers en el commit `7ecb1e1b4fe500be7fb7381a7bb79a24d7fa3941` y el adaptador `infer.py`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de imagen.
- Entorno de validacion: Python 3.11, OpenVINO 2026.4.0, OpenVINO GenAI 2026.4.0, NNCF 3.4.0, PyTorch 2.7.0, Transformers 5.10.4 y Diffusers en el commit indicado.
- Latencia y throughput: 455,7 segundos para una imagen 1024x1024 en 16 pasos en el entorno medido, con el transformer en CPU. El autor advierte que el rendimiento depende en gran medida de la CPU y el dispositivo OpenVINO empleados. No se publica throughput por segundo.

## Comparativa con modelos similares

Los datos de parametros proceden de la comparativa publicada por Black Forest Labs para el modelo base. La licencia y la disponibilidad de los modelos competidores no se detallan en la informacion proporcionada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX 3 Image Klein (base) | 5,6B | No disponible | Primero en evaluaciones internas de BFL en texto a imagen, multi-referencia y edicion | flux-kommunity-license-v1.0 | Pesos abiertos, acceso restringido |
| Esta conversion (OpenVINO INT4/INT8) | 5,6B (transformer comprimido a 2,83 GB) | No disponible | Similitud coseno 0,969 vs BF16 en una entrada de calibracion | flux-kommunity-license-v1.0 | Pesos abiertos, acceso restringido + adaptador incluido |
| Qwen-Image 2.1 | 7B | No disponible | No disponible | No disponible | No disponible |
| Krea 2 | 12,9B | No disponible | No disponible | No disponible | No disponible |
| Ideogram V4.5 | No disponible | No disponible | No disponible | Modelo cerrado | No disponible |
| FLUX.2 [pro] | No disponible | No disponible | No disponible | Modelo cerrado | No disponible |

## Limitaciones y advertencias

- Conversion experimental: el autor la describe explicitamente como experimental y advierte de que la API ModularPipeline de Diffusers para FLUX.3 y la ruta de exportacion a OpenVINO pueden cambiar.
- Solo texto a imagen: el IR no incluye las entradas necesarias para edicion con imagen de referencia, que el modelo base si soporta en su version original. El adaptador rechaza esas entradas.
- El repositorio no es una copia completa del modelo: contiene el transformer comprimido y un adaptador, no el codificador de texto, el tokenizer, el VAE ni el scheduler, que deben cargarse desde el modelo original restringido.
- Acceso restringido: el modelo base requiere solicitud y aprobacion por parte de Black Forest Labs, ademas de un token `HF_TOKEN` valido para la descarga.
- Licencia: se aplica flux-kommunity-license-v1.0. Es imprescindible leer el texto completo antes de cualquier uso o redistribucion, ya que impone condiciones especificas al uso comercial.
- Calidad de la cuantizacion: el propio autor senala que la cuantizacion altera el contraste y el detalle fino, y que las metricas de error reportadas corresponden a una sola entrada, no a una evaluacion amplia.
- Rendimiento: los 455,7 segundos por imagen en el entorno medido indican una latencia alta y poco adecuada para uso interactivo con el transformer en CPU.
- Riesgo de sesgos y alucinacion visual: no se aporta informacion sobre sesgos del modelo base en la documentacion disponible. Black Forest Labs menciona que encargo a un socio externo de seguridad, Cinder, la evaluacion de los checkpoints antes del lanzamiento, con menos vulnerabilidades que otros modelos abiertos populares.
- Idiomas: no se declara cobertura de idiomas para los prompts, por lo que no puede confirmarse el soporte multilingue.
- Fecha de publicacion: el repositorio figura creado el 15 de octubre de 2026, posterior a la fecha actual, dato relevante a la hora de contextualizar la version del ecosistema OpenVINO y Diffusers empleada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xgirls/flux-3-klein-openvino-int4-awq
- Modelo base (acceso restringido): https://huggingface.co/black-forest-labs/flux-3-image-klein
- Licencia del modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein/blob/main/LICENSE.md
- Codigo de inferencia de referencia de FLUX 3 Image Klein: https://github.com/black-forest-labs/flux-3-image-klein
- Blog de Black Forest Labs sobre FLUX 3 Image Klein: https://bfl.ai/blog/flux-3-image-klein
- Proyecto Fern (estudio de imagen local con OpenVINO): https://github.com/xgirls-dev/fern
- Nota de prensa sobre el lanzamiento y la evaluacion de seguridad: https://finance.yahoo.com/technology/ai/articles/black-forest-labs-expands-access-150500027.html
- Cobertura sobre parametros y precios de API: https://www.technobezz.com/news/black-forest-labs-flux-image-klein-parameters
