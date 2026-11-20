# xinxin713/openva-listener-dystream-step1200

## Resumen

OpenVA Listener · step 1,200 es un adaptador de pesos publicado por el usuario xinxin713 sobre el modelo base DyStream, orientado a la animación de retratos y, en concreto, al comportamiento de escucha de avatares digitales. No se trata de un modelo de lenguaje ni de un generador de movimiento completo, sino de un conjunto mínimo de pesos adicionales (12.288 parámetros FP32 en total) que modifica la proyección de audio del interlocutor para reducir la apertura excesiva de boca cuando el avatar escucha en lugar de hablar.

El problema que aborda es muy específico: en sistemas de diálogo con avatares (OpenVA-Dialogue), el modelo de movimiento tiende a producir aperturas de boca y parpadeos poco naturales durante los turnos en los que el personaje no habla. El autor reporta que, en una prueba de vídeo largo con cinco rostros fijos y 126 segundos de audio del interlocutor, la duración acumulada de apertura de boca evidente baja de 22,60 s a 7,20 s, y los eventos de parpadeo profundo pasan de 139 a 125. El propio autor advierte que se trata de un candidato para investigación y control, y que no ha superado la validación de comportamiento ni en vídeo corto ni en vídeo largo.

La relevancia es acotada pero clara para quien trabaje en animación de retratos: demuestra que un ajuste de apenas 12.288 parámetros sobre la proyección de audio puede alterar de forma medible el comportamiento de escucha, con un diseño experimental que incluye un grupo de control con historial real ruidoso. La arquitectura subyacente es la del modelo generativo de movimiento DyStream, y el adaptador se distribuye como safetensors junto a un script de carga en PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre el modelo generativo de movimiento DyStream (no se detalla la arquitectura interna del base en la informacion disponible) |
| Parametros totales | 12.288 parametros nuevos (dos bloques FP32: `down` y `up`); el resto de pesos del base permanecen congelados |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible; ventana de entrenamiento de 96 fotogramas con supervision de 95 posiciones continuas |
| Tipos de cuantizacion | no disponible; pesos en FP32 |
| Idiomas soportados | zh, en (etiquetas de la model card; el modelo procesa audio, no texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`listener-step1200.safetensors`, 49.296 bytes) |

## Arquitectura y entrenamiento

El adaptador no redefine el modelo generativo: se instala sobre el DyStream de robinwitch (commit `9ad5b1d3b0ef7aece4b9855d972c1f819f04dfbb`, checkpoint `checkpoints/last.ckpt`) y añade dos bloques de pesos FP32 (`down` y `up`) a la capa de proyección de audio del interlocutor, `audio_other_proj`. Durante la escucha, la salida original de la proyección se incrementa con `up(down(x))` con escala 1; el resto de pesos del modelo base permanece congelado y se aplica la EMA original.

El entrenamiento usa ventanas de 96 fotogramas que supervisan las 95 posiciones continuas siguientes con acciones de 512 dimensiones; los últimos 5 fotogramas reciben un peso de pérdida de 3 y el resto de 1. Se emplea historial de acciones generado por el propio modelo con truncado de gradiente, 5 pasos de denoising, MSE ponderado sobre toda la cara, y no se usan KL ni pérdidas separadas de ojos o boca. El conjunto consta de 489 vídeos de entrenamiento. Existe un grupo de control que mantiene base, orden de datos, objetivo, pasos de denoising y número de actualizaciones, sustituyendo el historial autogenerado por acciones reales con ruido. La evaluación mostrada usa inferencia a 1 paso.

## Capacidades

- Modulación del comportamiento de escucha en avatares animados: reduce la apertura de boca durante los turnos en los que el personaje escucha.
- Control de parpadeo: reduce los eventos de parpadeo profundo y los parpadeos de un solo fotograma en la configuración evaluada.
- Integración con el pipeline de OpenVA: se instala mediante `listener_adapter.py` y se activa por rol, con `USER_SPEAKING` habilitando el incremento y `ASSISTANT_ACTIVE` usando la proyección original.
- Compatibilidad con CUDA Graph del modelo base: el adaptador se instala antes de la primera compilación o captura del grafo.
- Igualdad numérica con el base cuando el incremento está desactivado, para las mismas entradas e historial.
- Idiomas: etiquetado para zh y en, aunque la entrada es audio y no texto.
- No dispone de tool calling, function calling, razonamiento multi-paso, visión ni modo thinking: es un adaptador de animación, no un modelo de lenguaje.

## Casos de uso

- Investigación en animación de retratos: servir como condición experimental frente al base y al grupo de control para estudiar cómo el historial autogenerado frente al real afecta al comportamiento de escucha.
- Sistemas de diálogo con avatar en chino e inglés: integrar el adaptador en OpenVA-Dialogue para que el personaje mantenga la boca cerrada mientras el usuario habla, reduciendo el artefacto de apertura excesiva.
- Prototipado de agentes conversacionales con cara animada: usar el adaptador como punto de partida para ajustar el comportamiento no verbal en demostraciones, siempre con validación visual a velocidad real.
- Evaluación comparativa de adaptadores de bajo coste: dado su tamaño (12.288 parámetros), permite iterar y comparar variantes con un coste de entrenamiento y almacenamiento mínimo.
- Control de calidad en pipelines de generación de vídeo: medir métricas de apertura de boca y parpadeo (como las del `evaluation.json`) para detectar regresiones antes de publicar un clip.
- Reproducción de experimentos: el repositorio incluye configuración, SHA-256 de pesos y script de carga, lo que facilita replicar la comparación entre historial propio y real ruidoso.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (cinco rostros, 126 s de audio del interlocutor, semilla 44, inferencia a 1 paso, 25 fps, 630 s en total):

| Metrica | DyStream original | Historico propio, 1.200 pasos | Historico real ruidoso, 1.200 pasos |
|---|---:|---:|---:|
| Duracion acumulada de apertura de boca evidente | 22,60 s | 7,20 s | 20,24 s |
| Eventos de parpadeo profundo | 139 | 125 | 120 |
| Eventos de parpadeo (umbral 0,50) | 160 | 149 | 139 |
| Parpadeos de un solo fotograma (umbral 0,50) | 39 | 43 | 28 |

En la validación adicional con retratos frontales de boca cerrada recién generados, misma audio y semilla, 126 s a velocidad original, los eventos en los que la apertura geométrica de ambos ojos cae por debajo del 35 % de la apertura típica y luego se reabren fueron 26 y 24 para el original y el grupo de historial propio, respectivamente; de ellos, solo un fotograma (40 ms) en fase de cierre profundo en 15 y 16 casos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma aislada; depende del modelo base DyStream y de su pipeline de OpenVA, no del adaptador, que solo añade 49.296 bytes de pesos.
- GPU recomendadas: no disponibles en la información proporcionada; el base usa CUDA Graph, lo que sugiere ejecución en GPU NVIDIA, pero no se especifican modelos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: PyTorch con `safetensors`, mediante `listener_adapter.py` y el flujo de carga original de OpenVA; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles; la evaluación mostrada usa inferencia a 1 paso y 25 fps, sin cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenVA Listener · step 1.200 | 12.288 nuevos (adaptador) | Ventana de 96 fotogramas | Apertura de boca 7,20 s frente a 22,60 s del base en la prueba del autor | no disponible | Hugging Face (xinxin713) |
| DyStream (base) | no disponible | no disponible | Apertura de boca 22,60 s; 139 parpadeos profundos | no disponible | Hugging Face (robinwitch/DyStream) |
| Control con historial real ruidoso, 1.200 pasos | 12.288 nuevos (adaptador) | Ventana de 96 fotogramas | Apertura de boca 20,24 s; 120 parpadeos profundos | no disponible | Incluido en el mismo repositorio |

No se dispone de información sobre otros adaptadores de escucha comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El propio autor indica que es un candidato para control en investigación y que no ha superado la validación de comportamiento ni en vídeo corto ni en vídeo largo.
- El beneficio medido se limita a una prueba concreta: cinco rostros, un único audio de 126 s, semilla 44, inferencia a 1 paso y 25 fps; no hay evidencia de generalización a otras caras, audios o semillas.
- La profundidad del parpadeo y la forma de la cara varían entre rostros; los conteos no sustituyen la inspección visual a velocidad real.
- El adaptador solo actúa sobre la proyección de audio del interlocutor; no corrige otros artefactos del modelo base.
- Al alterar el historial de acciones durante la escucha, la trayectoria de habla posterior puede cambiar respecto al base.
- Licencia no disponible: no puede confirmarse el uso comercial.
- No se han publicado datos de sesgos, alucinación (no aplica a generación de texto) ni restricciones de idioma más allá de las etiquetas zh/en.
- El repositorio figura con 0 descargas y 0 likes, y un tamaño de 0.0 GB, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xinxin713/openva-listener-dystream-step1200
- Modelo base DyStream: https://huggingface.co/robinwitch/DyStream
- Checkpoints del base (commit referenciado): https://huggingface.co/robinwitch/DyStream/tree/9ad5b1d3b0ef7aece4b9855d972c1f819f04dfbb/checkpoints
- Código del autor de DyStream: https://github.com/RobinWitch/DyStream
- OpenVA-Dialogue: https://github.com/XinchengSun/OpenVA-Dialogue
