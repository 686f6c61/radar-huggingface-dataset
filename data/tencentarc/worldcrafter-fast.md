# TencentARC/WorldCrafter-Fast

## Resumen

WorldCrafter-Fast es un modelo de generación de vídeo de pesos abiertos publicado por TencentARC en HuggingFace bajo el identificador `TencentARC/WorldCrafter-Fast`. Se distribuye a través de la librería `diffusers` y cubre tres tareas: generación de vídeo a partir de texto, generación de vídeo a partir de una imagen y una demo interactiva de image-to-video con control de cámara. El repositorio ocupa 147,2 GB e incluye pesos autocontenidos: dos ramas transformer con LoRA DMD y adaptadores de cámara independientes, además del RepEncoder, el codificador de texto, el tokenizer, el VAE y el scheduler.

La propuesta técnica del modelo se centra en la velocidad de inferencia. El autor describe un esquema de generación por chunks con muy pocos pasos de muestreo: cinco pasos de alto ruido y uno de bajo ruido por chunk en image-to-video, y una secuencia variable en text-to-video (cuatro pasos de alto ruido y ocho de bajo ruido en el primer chunk, y dos y cuatro respectivamente en los siguientes). La compilación con `--enable-compile` es opcional. No se necesita ningún fichero de WorldCrafter-Base para la inferencia en modo Fast.

El modelo es relevante ahora porque combina tres capacidades que hasta hace poco requerían pipelines separados (text-to-video, image-to-video y control explícito de cámara) en un único paquete de pesos con requisitos de inferencia reducidos. Sin embargo, la información publicada es muy escasa: no se declaran parámetros, licencia, idiomas, datos de entrenamiento ni resultados de benchmarks, lo que limita la evaluación rigurosa antes de un uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión latente con dos ramas transformer, cada una con LoRA DMD y adaptadores de cámara independientes; incluye RepEncoder, codificador de texto, tokenizer, VAE y scheduler (tipo concreto de transformer y de VAE: no disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de contexto de texto; duración de vídeo por chunk no documentada) |
| Tipos de cuantización | no disponible (no se documentan pesos GGUF, AWQ, GPTQ ni fp8) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la ficha de HuggingFace no declara licencia) |
| Formato de pesos | safetensors, consumidos vía `diffusers` |
| Tarea principal | image-to-video y text-to-video con control de cámara |
| Librería | diffusers |
| Tamaño del repositorio | 147,2 GB |
| Fecha de publicación en HuggingFace | 21 de septiembre de 2026 (según la ficha) |
| Última actualización en HuggingFace | 21 de septiembre de 2026 (según la ficha) |
| Descargas y likes | 0 descargas, 3 likes en el momento de la consulta |

## Arquitectura y entrenamiento

La model card describe una arquitectura de difusión con dos ramas transformer que operan de forma independiente y que llevan sus propios adaptadores LoRA DMD y sus propios adaptadores de cámara. El repositorio es autocontenido: incorpora el RepEncoder, el codificador de texto, el tokenizer, el VAE y el scheduler, de modo que la inferencia Fast no depende de los ficheros de WorldCrafter-Base. El fichero `inference_config.json` resuelve los componentes compartidos desde el propio directorio (`shared_components: "."`), por lo que todas las carpetas de componentes deben mantenerse juntas. La procedencia de los checkpoints y sus hashes de validación se registran en `manifest.json`, y `SHA256SUMS` cubre los ficheros empaquetados.

No se publican datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni sobre el procedimiento exacto de destilación asociado a las LoRA DMD. La model card tampoco detalla la innovación técnica más allá de la descripción del muestreo por chunks con pocos pasos y de la existencia de adaptadores de cámara separados por rama. Todo lo anterior debe considerarse no disponible.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video), con un esquema de pasos de muestreo distinto para el primer chunk y para los siguientes.
- Generación de vídeo a partir de una imagen (image-to-video), con cinco pasos de alto ruido y uno de bajo ruido por chunk.
- Control de cámara, implementado mediante adaptadores específicos en cada una de las dos ramas transformer.
- Demo interactiva de image-to-video, según la propia descripción del autor.
- Generación por chunks, lo que permite producir vídeo por tramos sucesivos en lugar de en una única pasada.
- Compilación opcional del grafo de inferencia mediante `--enable-compile`.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Capacidades multilingües: no disponible; no se especifica qué idiomas admiten los prompts de texto.
- Modo "thinking", visión o audio como entrada: no disponible.
- Salida de audio: no disponible.

## Casos de uso

- Animática y previsualización de storyboards: a partir de un frame o fotograma clave se puede generar un clip corto que permita validar encuadre, ritmo y movimiento antes de rodar. El modelo es adecuado porque acepta image-to-video y ofrece control de cámara explícito.
- Publicidad y contenido para redes: generación de clips breves por chunks a partir de un prompt de texto o de una imagen de producto, con el ajuste de pasos reducido que propone el autor para acelerar la iteración creativa.
- Previz de VFX y planificación de cámara: los adaptadores de cámara permiten ensayar movimientos de cámara sobre una imagen fija antes de trasladarlos a un plano real o a un pipeline 3D.
- Prototipado de interfaces generativas: la demo interactiva de image-to-video encaja en el desarrollo de productos donde el usuario manipula una imagen y observa el resultado en vídeo, útil para pruebas de concepto con usuarios.
- Creación de material de fondo para videojuegos y entornos virtuales: generación de clips de ambiente a partir de una imagen de referencia, reutilizables como texturas animadas o pantallas de carga.
- Aumento de datos sintéticos para visión por computador: generación de secuencias con trayectorias de cámara conocidas para complementar datasets de odometría visual o de seguimiento, siempre que se validen las anotaciones derivadas.
- Extensión o continuación de clips existentes: al trabajar por chunks, el modelo puede emplearse para alargar un plano tomando el último fotograma como entrada, un flujo habitual en post-producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de `TencentARC/WorldCrafter-Fast` no incluye métricas cuantitativas (FVD, CLIP-SIM, VBench ni similares) ni comparaciones numéricas con otros modelos. Los resultados de búsqueda web proporcionados no contienen información relevante sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica cifras de memoria. Como referencia orientativa no confirmada, el repositorio completo ocupa 147,2 GB, de modo que la inferencia en precisión nativa requiere previsiblemente aceleradores de centro de datos con decenas de GB de VRAM; esta estimación no está validada por el autor.
- GPU recomendadas: no disponibles. Por el tamaño del paquete, el escenario realista apunta a A100 (40/80 GB) o H100, pero es una inferencia propia y no un dato publicado.
- ¿Cabe en GPU de consumo? No hay confirmación. No se documentan pesos cuantizados ni variantes GGUF, AWQ o fp8 que permitan reducir el consumo por debajo de los 24 GB de una RTX 4090. Sin cuantización publicada, no puede afirmarse que quepa en GPU de consumo.
- Opciones de despliegue: la vía documentada es el script `inference.py` del repositorio de código de WorldCrafter, ejecutado dentro del entorno `uv` fijado por el autor (`python inference.py --model-type fast --model-path weights/WorldCrafter-Fast --output-path outputs/fast.mp4`). Se puede añadir `--enable-compile`. El modelo se carga con `diffusers`, por lo que debería ser compatible con otros runners basados en esa librería. Servidores de inferencia de texto como vLLM, TGI, Ollama o llama.cpp no son aplicables a un modelo de difusión de vídeo.
- Latencia y throughput: no disponibles. El autor menciona un número reducido de pasos de muestreo por chunk como estrategia de aceleración, pero no publica tiempos por clip, FPS de salida ni comparativas con la variante no Fast.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la información proporcionada, y la propia ficha de WorldCrafter-Fast omite parámetros, licencia y métricas, lo que impide una comparación numérica rigurosa. A continuación se indican alternativas de la misma categoría (generación de vídeo open source), sin datos numéricos, que deben verificarse en sus fichas oficiales:

| Modelo | Tipo | Parámetros | Contexto o duración | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TencentARC/WorldCrafter-Fast | Difusión de vídeo con control de cámara | no disponible | no disponible | no disponible | HuggingFace, `diffusers`, 147,2 GB |
| Alternativas open source de vídeo (por ejemplo, familias tipo Wan, HunyuanVideo o LTX-Video) | Difusión de vídeo | requiere verificación | requiere verificación | requiere verificación | requiere verificación |

No se incluyen cifras de estas alternativas porque no proceden de la información suministrada para esta ficha.

## Limitaciones y advertencias

- Licencia no declarada: la ficha de HuggingFace no especifica licencia, por lo que no puede asumirse permiso de uso comercial. Es un bloqueo potencial para producción y debe aclararse con el autor antes de cualquier despliegue.
- Ausencia de benchmarks: no hay métricas publicadas de calidad visual, coherencia temporal ni fidelidad al prompt, lo que impide comparar objetivamente con alternativas.
- Sesgos: no disponibles. No se documenta la composición del dataset de entrenamiento, por lo que no pueden evaluarse sesgos demográficos, culturales o de representación.
- Alucinación y artefactos: en modelos de difusión de vídeo son esperables inconsistencias temporales, parpadeo, deformaciones en manos y rostros o deriva de la escena entre chunks. El autor no documenta el comportamiento en los límites entre chunks.
- Idioma de los prompts: no disponible. No puede confirmarse un buen rendimiento en castellano ni en idiomas distintos del inglés.
- Duración y resolución: no documentadas. Al generar por chunks, la longitud máxima de vídeo y la resolución nativa no están especificadas.
- Restricciones técnicas de empaquetado: `inference_config.json` resuelve componentes compartidos desde el propio directorio (`shared_components: "."`), y el autor indica explícitamente que hay que mantener todas las carpetas de componentes juntas. Mover o eliminar componentes rompe la inferencia.
- Dependencia de código externo: los pesos deben usarse con el código de inferencia de WorldCrafter y su entorno `uv` fijado; no se garantiza funcionamiento con otras versiones de `diffusers`.
- Peso del repositorio: 147,2 GB dificultan el despliegue en entornos con almacenamiento o ancho de banda limitados.
- Madurez: con 0 descargas y 3 likes en el momento de la consulta, no existe una base de usuarios que haya validado el comportamiento en producción.
- Fecha de publicación: la ficha indica el 21 de septiembre de 2026, dato que conviene verificar antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TencentARC/WorldCrafter-Fast
- Repositorio de código de WorldCrafter: mencionado en la model card ("WorldCrafter inference code", "code repository root") pero sin URL publicada; no disponible.
- Paper, blog o demo oficial: no disponible.
- Los resultados de búsqueda web proporcionados no contienen enlaces relevantes para este modelo (corresponden a documentación de Microsoft Teams y a guías no relacionadas).
