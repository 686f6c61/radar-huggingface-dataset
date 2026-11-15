# yujiepan/haru-4b-tiny-random

## Resumen
haru-4b-tiny-random es un modelo de audio a audio de inicializacion aleatoria, publicado por el usuario yujiepan en Hugging Face, que reproduce a escala minima la arquitectura del modelo higurashi-ai/Haru-4B. No es un modelo entrenado ni utilizable en produccion: segun la propia model card, se trata de un checkpoint generado para pruebas y depuracion del codigo de inferencia duplex del proyecto Haru. Su interes es, por tanto, instrumental: permite validar pipelines, formas de tensores y APIs sin necesidad de descargar los 10,54 GB del checkpoint original.

La arquitectura combina un backbone de lenguaje tipo Qwen3.5 con atencion hibrida (tres capas lineales por cada capa de atencion completa), un codec de audio VibeVoice y una cabeza MeanFlow para la generacion de audio. El checkpoint real de Haru-4B tiene 5,27 mil millones de elementos en BF16 y un vocabulario de 248.320 tokens con embeddings atados; esta version reducida conserva ese vocabulario y la cadencia de atencion, pero recorta profundidad, anchura y dimensiones del codec hasta dejarlo en 8,36 millones de parametros.

El modelo es relevante unicamente como artefacto de desarrollo: la model card incluye un ejemplo verificable de sesion duplex que genera seis tramas de 133 ms de audio sintetico y comprueba que las muestras son finitas, estan en el rango [-1, 1] y producen tokens validos dentro del vocabulario. No hay informacion sobre entrenamiento, datos, licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: backbone de lenguaje Qwen3.5 con atencion lineal cada 3 capas + codec VibeVoice + cabeza MeanFlow |
| Parametros totales | 8.355.227 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento
El modelo replica a escala reducida el diseno de Haru-4B. El backbone de lenguaje es una variante de Qwen3.5 con 8 capas (frente a 32 en el modelo completo), atencion hibrida con cadencia de tres capas lineales seguidas de una capa de atencion completa, y dos ciclos completos de esa cadencia. Las dimensiones internas estan severamente recortadas: anchura oculta de 32 y anchura MLP de 64 (frente a 2.560 y 9.216), 4 cabezas de consulta, 1 cabeza de clave-valor y dimension de cabeza de 16 (frente a 16/4/256). El vocabulario se mantiene intacto en 248.320 tokens con embeddings atados.

El codec de audio es VibeVoice con base 1 y profundidad 1 (frente a base 32 y profundidades 3-8), manteniendo latentes de audio de 64 dimensiones a 7,5 Hz. La cabeza MeanFlow se reduce a 1 capa y 1 paso (frente a 4 capas y 1 paso). Los pesos estan inicializados aleatoriamente: no hay evidencia de entrenamiento, ajuste fino, RLHF ni DPO. La model card indica que el repositorio fue generado por GPT-6.1-Sol y que el checkpoint sirve para probar y depurar el codigo del proyecto Haru.

## Capacidades
- Generacion de audio a audio en modo duplex: el ejemplo de la model card ejecuta una sesion con seis tramas de 133 ms (3.200 muestras a 24 kHz) a partir de una voz de referencia sintetica.
- Generacion de texto acoplada al audio: cada trama incluye un token de texto dentro del vocabulario de 248.320 entradas.
- Soporte de atencion hibrida lineal y completa, con dos ciclos completos de la cadencia 3+1.
- Ejecucion parcial en CPU: solo las capas de atencion lineal del modelo de lenguaje requieren CUDA; el codec y la cabeza pueden ejecutarse en CPU.
- No se han documentado capacidades de tool calling, agentes, vision, matematicas, codigo ni multilingues.
- Al estar inicializado aleatoriamente, no produce salidas semanticamente coherentes; las capacidades anteriores son estructurales, no funcionales.

## Casos de uso
- Pruebas unitarias del pipeline duplex: el modelo permite ejecutar sesiones completas con tramas de 133 ms y verificar formas, tipos y rangos de las salidas sin descargar el checkpoint de 10,54 GB.
- Depuracion de integraciones con la libreria haru: sirve para validar la instalacion desde el repositorio de GitHub, la carga con `HaruModel.from_pretrained` y la configuracion de `DuplexConfig`.
- Validacion de compatibilidad de tokenizador: al conservar el vocabulario de 248.320 tokens, permite comprobar el manejo de identificadores especiales (por ejemplo, los tokens 248.076 y 248.071 excluidos en el ejemplo).
- Integracion continua en el repositorio Haru: un checkpoint de 16,7 MB puede descargarse en segundos dentro de un runner de CI para ejecutar pruebas de regresion del codigo de inferencia.
- Desarrollo en equipos sin GPU de gama alta: al necesitar CUDA solo para las capas lineales y poder ejecutar codec y cabeza en CPU, facilita el trabajo en portatiles.
- Prototipado de interfaces de audio duplex: permite construir demos de captura y reproduccion de tramas antes de disponer de pesos entrenados.
- Verificacion de empaquetado y serializacion: util para comprobar que las herramientas de conversion y carga manejan correctamente un unico archivo safetensors de 16,7 MB.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: inferior a 1 GB para inferencia en BF16, dado que el checkpoint pesa 16,74 MB; no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU con soporte CUDA para las capas de atencion lineal; el resto del pipeline puede ejecutarse en CPU.
- Cabe en cualquier GPU consumer con CUDA, incluidas las de gama baja, y potencialmente en CPU si se adapta la ejecucion.
- Opciones de despliegue: libreria haru instalada desde `pip install 'git+https://github.com/higurashi-ai/Haru#subdirectory=haru'`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el ejemplo de la model card ejecuta seis tramas de 133 ms, pero no se publican tiempos de ejecucion.

## Comparativa con modelos similares
No disponible. La informacion proporcionada solo permite comparar con el modelo base higurashi-ai/Haru-4B, del que este checkpoint es una version reducida para pruebas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| yujiepan/haru-4b-tiny-random | 8,36 M | no disponible | no disponible | Hugging Face |
| higurashi-ai/Haru-4B | 5,27 B (BF16) | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias
- Pesos inicializados aleatoriamente: el modelo no genera audio ni texto coherentes y no debe usarse en produccion.
- Riesgo elevado de alucinacion y salidas sin sentido, derivado directamente de la inicializacion aleatoria.
- Sin informacion sobre sesgos, datos de entrenamiento o evaluacion de calidad.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribucion.
- Idiomas no disponibles: no hay evidencia de capacidades multilingues.
- Longitud de contexto no disponible; la arquitectura recortada no permite extrapolar el comportamiento del modelo completo.
- El vocabulario se mantiene en 248.320 tokens pese al recorte del backbone, lo que desproporciona la matriz de embeddings respecto al resto de dimensiones.
- El repositorio fue generado por GPT-6.1-Sol segun la model card, sin que se detallen los metodos de verificacion.
- La fecha de creacion indicada (2026-11-15) es futura respecto a la informacion habitual de publicaciones; conviene verificar la procedencia del repositorio.

## Enlaces
- Hugging Face: https://huggingface.co/yujiepan/haru-4b-tiny-random
- Modelo base: https://huggingface.co/higurashi-ai/Haru-4B
- Repositorio del proyecto Haru: https://github.com/higurashi-ai/Haru
- Script de creacion del checkpoint: .meta/create_model.py (dentro del repositorio de Hugging Face)
- Estructura del modelo: .meta/model.log (dentro del repositorio de Hugging Face)
- Entorno de creacion: .meta/env.json (dentro del repositorio de Hugging Face)
