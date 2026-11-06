# wardner/Qwen3-TTS

## Resumen

Qwen3-TTS es un modelo de síntesis de voz (text-to-speech) de la serie Qwen3 desarrollada por el equipo Qwen de Alibaba Cloud. Este repositorio concreto, publicado por el usuario wardner, no contiene los pesos originales del modelo, sino los artefactos de despliegue convertidos para la NPU Rockchip RK3588: grafos RKNN, pesos asociados y tablas de embeddings en FP16, junto con el manifiesto de worker que necesita la capa de cómputo de wdnwebui.

El paquete está pensado para ejecución en el borde (edge AI) sobre el chip RK182x montado en una plataforma anfitriona RK3588, con un runtime híbrido RKLLM + RKNN. El repositorio ocupa 2,1 GB e incluye los grafos del talker, el predictor de códigos, el decodificador de voz, el codificador de hablante y la proyección de texto, además del tokenizer y las tablas de embeddings.

Su relevancia radica en que permite ejecutar un modelo TTS de la familia Qwen3 en hardware de bajo consumo sin GPU dedicada, algo poco habitual en el ecosistema de modelos de voz. La licencia Apache 2.0 del modelo original facilita su integración en productos comerciales, aunque los ficheros publicados son derivados convertidos, no los pesos upstream sin modificar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (grafo TTS con componentes talker, code predictor, speech decoder, speaker encoder y text projection) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP16 para tablas de embeddings; grafos RKNN con cuantización propia del compilador (detalle no disponible) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | RKNN (grafos), `.weight` (pesos asociados), `.fp16.bin` (embeddings), `.npy` (filtro mel), `tokenizer.json` |
| Chip objetivo | RK182x (NPU de 1,82 TOPS) sobre host RK3588 |
| Runtime | RKLLM + RKNN |
| Memoria estimada | ~1900 MB |
| Tiempo de inicialización | ~30 s |
| Tamaño del repositorio | 2,1 GB |
| Capacidad declarada | `swcap_text_to_speech` |
| Worker factory | `qwen3_tts` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original ni su proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). Lo que sí se documenta es la descomposición en grafos del artefacto convertido: talker, code predictor, speech decoder, speaker encoder y text projection, lo que sugiere una arquitectura de TTS neural con un módulo generativo principal (talker), un predictor de tokens de código acústico y un decodificador de voz, además de un codificador de hablante para condicionamiento por voz.

El repositorio incluye tres tablas de embeddings en FP16 (text embed, input embed y codec embed) que suman aproximadamente 750 MB y se cargan directamente, sin pasar por la ruta genérica de liberación de tablas de embeddings; la memoria se recupera mediante `malloc_trim` al descargar el modelo. Los grafos RKNN están compilados específicamente para la generación de NPU de 1,82 TOPS (`available_targets: 182x`), lo que implica que no son portables a otras generaciones de NPU Rockchip sin recompilación.

## Capacidades

- Síntesis de voz a partir de texto (pipeline `text-to-speech`).
- Condicionamiento por hablante mediante codificador de hablante y filtro mel (`speaker_encoder_mel.npy`).
- Generación de tokens acústicos mediante talker y code predictor, decodificados a audio por el speech decoder.
- Ejecución en NPU de borde (RK182x) con runtime RKLLM + RKNN.
- Integración con la capa de cómputo de wdnwebui mediante manifiesto de worker (`qwen3-tts.json`).
- No se documentan en la información disponible capacidades de clonación de voz, diseño de voz libre, streaming, tool calling ni multilingüismo para este artefacto concreto, aunque el proyecto upstream Qwen3-TTS las menciona a nivel de serie.

## Casos de uso

- Asistentes de voz embebidos: el modelo se ejecuta en la NPU RK182x de un RK3588, por lo que puede integrarse en dispositivos sin GPU para convertir respuestas de texto en audio localmente, con una huella de memoria de unos 1900 MB.
- Lectura de notificaciones y alertas en dispositivos IoT: la inferencia en el propio dispositivo evita enviar texto a la nube y permite síntesis con baja dependencia de red.
- Interfaces de accesibilidad: conversión de texto de pantalla a voz en terminales de bajo consumo, usando el codificador de hablante para mantener una voz consistente.
- Kioscos y paneles informativos: generación de locuciones pregrabadas o dinámicas en hardware Rockchip, con arranque del worker en torno a 30 s y ejecución continua.
- Prototipado de pipelines TTS en edge: el manifiesto `qwen3-tts.json` y la integración con wdnwebui permiten desplegar y comparar el modelo en un banco de pruebas local sin infraestructura cloud.
- Investigación en despliegue de modelos de voz en NPU: los grafos RKNN y las tablas FP16 separadas facilitan estudiar el reparto de cómputo entre NPU y CPU y el consumo de memoria en un SoC de borde.
- Automatización industrial con avisos hablados: en entornos donde no se permite salida a Internet, la síntesis local sobre RK3588 cubre la locución de mensajes operativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- NPU objetivo: RK182x (1,82 TOPS), sobre plataforma anfitriona RK3588. Los grafos no están compilados para otras NPU.
- Memoria estimada en ejecución: ~1900 MB, incluyendo ~750 MB de tablas de embeddings FP16.
- Tiempo de inicialización: ~30 s.
- No cabe en GPU de consumo en este formato: los artefactos son RKNN, no safetensors ni GGUF, por lo que no se ejecutan en CUDA ni en llama.cpp/Ollama.
- Despliegue: runtime RKLLM + RKNN dentro de wdnwebui; el modelo se detecta automáticamente al copiar la carpeta en el directorio raíz de modelos (reescaneo cada ~2 s) y se habilita desde la sección de configuración de cómputo.
- Variable de entorno: `WDNAI_QWEN3_TTS_DIR`, declarada en el manifiesto, permite que el SDK localice el directorio aunque el nombre de la carpeta no coincida con el del modelo.
- Latencia y throughput: no disponibles.
- Verificación de integridad: `sha256sum -c SHA256SUMS` debe devolver `OK` en todas las entradas antes del despliegue.

## Comparativa con modelos similares

| Modelo | Formato | Hardware objetivo | Memoria | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wardner/Qwen3-TTS (este repo) | RKNN + weights + FP16 bins | NPU RK182x / host RK3588 | ~1900 MB | Apache 2.0 | Hugging Face |
| Qwen3-TTS upstream (QwenLM) | no disponible en la información | no disponible | no disponible | Apache 2.0 (según este repo) | GitHub QwenLM/Qwen3-TTS |
| Otras alternativas TTS de borde | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Los ficheros publicados son derivados convertidos a RKNN, no los pesos originales de Qwen3-TTS; el comportamiento puede diferir del modelo upstream.
- Los grafos están compilados exclusivamente para la NPU de 1,82 TOPS (`182x`); no funcionan en otras generaciones de NPU Rockchip ni en GPU convencionales.
- Las tablas de embeddings FP16 (~750 MB) no se liberan por la ruta genérica; la memoria solo se recupera con `malloc_trim` al descargar el modelo, lo que puede provocar picos de memoria si se recargan workers.
- El repositorio no declara idiomas soportados; no debe asumirse cobertura multilingüe sin verificación.
- No se documentan métricas de calidad, latencia ni throughput; faltan datos para estimar viabilidad en producción a gran escala.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible.
- El autor del repositorio es un tercero (wardner), no el equipo Qwen; la licencia Apache 2.0 se hereda del modelo upstream, pero conviene revisar el fichero LICENSE y la documentación upstream antes de uso comercial.
- La descarga puede requerir un mirror (`HF_ENDPOINT=https://hf-mirror.com`) si `huggingface.co` no es accesible desde la red.
- Con `git clone` los pesos quedan como punteros LFS hasta ejecutar `git lfs pull`; se recomienda `hf download` para obtener los ficheros reales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/wardner/Qwen3-TTS
- Proyecto upstream en GitHub: https://github.com/QwenLM/Qwen3-TTS
