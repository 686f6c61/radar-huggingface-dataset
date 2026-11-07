# xirui824/credit-worth-models

## Resumen

`xirui824/credit-worth-models` es un conjunto de checkpoints de investigación publicados por Xirui Jiang (usuario `xirui824` en Hugging Face) como material de respaldo para el artículo *What's a Credit Worth? A Market Framework for Attribution-Aware Compensation in Generative Music*. No es un modelo conversacional ni un LLM: son pesos entrenados sobre dos modelos base de generación musical, `stabilityai/stable-audio-open-1.0` y `stanford-crfm/music-small-800k`, orientados a experimentos de atribución de datos (*data attribution*) mediante la técnica de *leave-one-out*.

El objetivo del trabajo es cuantificar cuánto contribuye cada pieza de datos de entrenamiento a las salidas del modelo generativo, con el fin de construir un marco de mercado para la compensación de artistas y titulares de derechos en música generativa. Los checkpoints permiten reproducir los resultados numéricos del artículo, no desplegar un sistema de generación musical en producción.

El repositorio ocupa 4,9 GB en el momento de la consulta, pero el autor indica que el archivo completo contiene 182 ficheros de pesos y 473 ficheros en total (unos 398,20 GiB lógicos) y que la subida aún no ha finalizado. El checkpoint disponible `sao_ip_100/outputs/models/0/model.ckpt` se entrenó con semilla 42 durante 50 épocas, con batch por dispositivo de 4 y acumulación de gradientes de 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de `stabilityai/stable-audio-open-1.0` y `stanford-crfm/music-small-800k`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se preservan los bytes y la precisión numérica originales del checkpoint) |
| Idiomas soportados | no disponible (modelo de audio musical, no de texto) |
| Licencia | component-dependent (ver sección de licencias en la model card) |
| Formato de pesos | checkpoints `.ckpt` (librería `stable-audio-tools`) |

## Arquitectura y entrenamiento

El repositorio no describe una arquitectura propia: agrupa checkpoints finetuneados a partir de dos modelos base. El componente derivado de Stable Audio Open queda sujeto a la Stable Audio Community License, y el componente derivado de Anticipatory Music Transformer (`stanford-crfm/music-small-800k`) mantiene la licencia Apache-2.0 upstream. La model card no detalla la arquitectura interna de cada base (transformer, difusión latente, etc.) ni el número de parámetros.

El entrenamiento documentado corresponde al experimento `sao_ip_100` (nombre histórico: el experimento usa 50 catálogos), con semilla 42, 50 épocas, batch por dispositivo 4 y acumulación de gradientes 2. El propósito es generar los pesos necesarios para el análisis de atribución *leave-one-out*, que requiere reentrenar el modelo dejando fuera subconjuntos de datos para medir su influencia. No se especifican en la información disponible el número de tokens, la composición exacta del dataset musical ni si hubo etapas de RLHF o DPO (no aplicables en un contexto de generación de audio).

## Capacidades

- Generación de audio musical (herencia de Stable Audio Open 1.0), sujeta a los pesos del checkpoint concreto.
- Modelado simbólico/secuencial musical mediante el componente Anticipatory Music Transformer.
- Soporte para experimentos de atribución de datos (*data attribution*) y análisis *leave-one-out*.
- Reproducción de los resultados numéricos del artículo asociado.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No es un modelo multilingüe ni procesa texto conversacional.
- No dispone de modo *thinking*, visión ni audio de entrada en el sentido de un asistente multimodal.

## Casos de uso

- Reproducción de experimentos académicos: cargar los checkpoints en un checkout del repositorio fuente para replicar las métricas de atribución del artículo.
- Investigación en atribución de datos: usar los modelos entrenados con subconjuntos *leave-one-out* para estimar la contribución marginal de cada pieza del corpus musical.
- Diseño de marcos de compensación: alimentar estudios económicos o legales sobre remuneración de artistas en música generativa con las estimaciones de crédito derivadas del análisis.
- Auditoría de datasets musicales: comparar el impacto de excluir catálogos concretos sobre la calidad de generación para detectar dependencias excesivas de ciertas fuentes.
- Docencia e investigación en generación musical: servir como material de partida para cursos o tesis sobre modelos generativos de audio y sus implicaciones éticas.
- Evaluación de licencias y cumplimiento: estudiar cómo se propagan las obligaciones de la Stable Audio Community License y Apache-2.0 en modelos derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El checkpoint publicado ocupa 4,52 GiB, pero el conjunto completo asciende a unos 398,20 GiB lógicos, por lo que el almacenamiento necesario es muy superior al de un modelo típico.
- GPU recomendadas: no disponible. Al derivar de Stable Audio Open, se requiere al menos una GPU con memoria suficiente para el modelo base correspondiente; el autor no especifica modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada.
- Opciones de despliegue: la librería indicada es `stable-audio-tools`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles. El único dato de rendimiento es la transferencia del primer checkpoint (4,52 GiB en 79,62 segundos), que no refleja inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `xirui824/credit-worth-models` | no disponible | no disponible | Atribución de datos en música generativa | component-dependent | Parcial (subida en curso) |
| `stabilityai/stable-audio-open-1.0` | no disponible en la información | no disponible | Generación de audio musical | Stable Audio Community License | Público |
| `stanford-crfm/music-small-800k` | no disponible en la información | no disponible | Modelado musical simbólico | Apache-2.0 | Público |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El repositorio es material de investigación, no un modelo listo para producción; no debe tratarse como un servicio de generación musical.
- La subida está incompleta: solo se ha verificado un checkpoint de los 182 previstos, por lo que el conjunto no es reproducible al completo todavía.
- El nombre del directorio `sao_ip_100` es histórico y no refleja el número real de catálogos (50), lo que puede inducir a error.
- La licencia es `component-dependent`: el uso comercial está condicionado por la Stable Audio Community License del componente Stable Audio Open y por la Apache-2.0 del componente Anticipatory Music Transformer; es necesario revisar ambas antes de cualquier uso.
- No se redistribuyen las grabaciones de entrenamiento, lo que limita la reproducibilidad completa de los experimentos sin acceso a los datos originales.
- No hay información sobre sesgos, alucinación o cobertura idiomática porque el modelo no opera sobre texto.
- El tamaño lógico del archivo completo (~398 GiB) exige infraestructura de almacenamiento considerable.
- No se han publicado métricas de calidad de generación ni comparativas con otros sistemas en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/xirui824/credit-worth-models
- Perfil del autor: https://huggingface.co/xirui824
- Repositorio de código (rama de archivo): https://github.com/jxbb824/stable-audio-tools/tree/archive/credit-worth-20261107
- Medición de transferencia: https://github.com/jxbb824/stable-audio-tools/blob/archive/credit-worth-20261107/preservation/transfer_probe.json
- Modelo base Stable Audio Open 1.0: https://huggingface.co/stabilityai/stable-audio-open-1.0
- Licencia Stable Audio Community: https://huggingface.co/stabilityai/stable-audio-open-1.0/blob/main/LICENSE
- Modelo base Anticipatory Music Transformer: https://huggingface.co/stanford-crfm/music-small-800k
- Sección de licencias de la model card: https://huggingface.co/xirui824/credit-worth-models/blob/main/README.md#licenses
