# yexiyue/talechime-resources

## Resumen

TaleChime Resources es un repositorio de recursos de ejecución (runtime resources) publicado por el usuario yexiyue en Hugging Face, no un modelo de pesos autocontenido al uso. Contiene datos auxiliares, tablas de pronunciación, diccionarios, componentes nativos convertidos y manifiestos de procedencia necesarios para ejecutar el stack de síntesis de voz TaleChime y CastGlean, que integra motores acústicos como Kokoro, CosyVoice3 e IndexTTS sobre el framework Candle en Rust. El repositorio está etiquetado como pipeline `text-to-speech` y su idioma declarado es únicamente el chino mandarín (zh).

El paquete principal, `kokoro/misaki-zh-v1/`, exporta diccionarios, datos de segmentación y POS-HMM, y reglas de pronunciación desde Misaki 0.9.4 fijado, para ser consumidos por un frontend nativo en Rust mientras la inferencia acústica queda en Candle. Incluye además tablas opcionales de contexto g2pW y componentes nativos verificados (pesos Kokoro en F32 para Candle, HiFT de CosyVoice3 con tensores F0 en F64, y tensores GPT, codec, s2mel, CAMPPlus y BigVGAN de IndexTTS en F32).

Es relevante ahora porque documenta un enfoque de empaquetado reproducible con hashes SHA-256, manifiestos de procedencia y licencias por componente, algo poco habitual en repositorios de TTS. No obstante, conviene subrayar que el repositorio no publica pesos acústicos completos ni un SDK, y que su licencia es mixta y específica por componente, con restricciones comerciales en algunas partes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Colección de recursos de runtime (frontend de pronunciación, tablas G2P, pesos convertidos para Candle); no es un modelo único |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | Pesos Kokoro en F32; tensores F0 de CosyVoice3 en F64; tensores IndexTTS en F32; ONNX opcional g2pW (sin cuantización declarada) |
| Idiomas soportados | Chino mandarín (zh); un caso mixto inglés declarado explícitamente no soportado |
| Licencia | Mixta y específica por componente (`component-specific-licenses`); incluye Apache-2.0, MIT y bilibili Model Use License Agreement para IndexTTS |
| Formato de pesos | safetensors, ONNX (g2pW opcional), datos de diccionario/tablas, manifiestos JSON |
| Tamano del repositorio | 5,8 GB |
| Pipeline declarado | text-to-speech |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio no describe el entrenamiento de un modelo, sino la preparación y verificación de recursos de inferencia. La arquitectura subyacente es un pipeline TTS híbrido: un frontend de texto a fonemas en Rust nativo que consume diccionarios y reglas exportadas de Misaki 0.9.4 (segmentación y POS-HMM), y un backend acústico ejecutado sobre Candle. Opcionalmente se integra un frontend contextual basado en g2pW, cuyo modelo ONNX oficial se descarga por separado desde su repositorio upstream fijado y se ejecuta con ORT en CPU.

Los componentes nativos verificados incluyen pesos Kokoro plegados en F32 para Candle, HiFT de CosyVoice3 con tensores F0 en F64, y GPT, codec, s2mel, CAMPPlus, BigVGAN y tensores de características de IndexTTS en layouts F32 verificados. La innovación destacable no es algorítmica sino de ingeniería de reproducibilidad: cada subdirectorio incluye registro de procedencia, hashes exactos, avisos de licencia y recetas de build reproducibles. La validación del frontend cubre 28 casos de mandarín que coinciden con la salida de Misaki fijada, y 24 casos oficiales de entrada/salida para g2pW, con un objetivo manual de 23/24 tanto en ejecución oficial como nativa. La aceptación acústica, de dispositivo y de escucha se declara como validación separada y no incluida en esta publicación.

## Capacidades

- Proporciona datos de pronunciación y segmentación para chino mandarín (diccionarios, POS-HMM, reglas) consumibles por un frontend nativo en Rust.
- Suministra tablas de contexto opcionales para desambiguación de pronunciación mediante g2pW.
- Incluye pesos convertidos y verificados para motores acústicos Kokoro, CosyVoice3 e IndexTTS en formatos adecuados para Candle.
- Ofrece manifiestos de procedencia y checksums SHA-256 para verificación de integridad en pipelines de despliegue.
- No incluye capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes.
- No incorpora modelo acústico ONNX propio; la inferencia acústica se delega en Candle y en los pesos upstream fijados.
- Soporte multilingüe limitado al chino mandarín; el inglés mixto no está soportado en el frontend validado.

## Casos de uso

- Despliegue de TTS en mandarín con frontend nativo: integrar `kokoro/misaki-zh-v1/` en una aplicación Rust que use Candle para la inferencia acústica, aprovechando que el paquete no requiere Python en tiempo de ejecución.
- Verificación de integridad en CI/CD: fijar un commit del repositorio y comprobar tamaños y SHA-256 contra la receta aprobada antes de empaquetar los recursos en una imagen de contenedor.
- Desambiguación de pronunciación contextual: usar las tablas de `kokoro/g2pw-context-v1/` junto con el modelo ONNX oficial de g2pW descargado aparte para resolver polifonías en textos chinos.
- Reproducción de builds nativos: emplear los registros de procedencia y las recetas de `native/` para reconstruir los pesos convertidos de Kokoro, CosyVoice3 e IndexTTS con layouts F32/F64 verificados.
- Auditoría de licencias en producto: revisar los avisos por componente antes de distribuir, dado que IndexTTS queda bajo el bilibili Model Use License Agreement y no bajo Apache-2.0.
- Evaluación comparativa de frontends G2P: usar el corpus de prueba independiente y los 24 casos oficiales para contrastar la ejecución nativa frente a la oficial de g2pW.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta validaciones funcionales: 28 casos de mandarín que coinciden con la salida de Misaki fijada (un caso mixto inglés no soportado) y 24 casos oficiales de g2pW coincidentes con el runtime nativo, con objetivo manual de 23/24.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio no publica requisitos de memoria para inferencia acústica.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime nativo en Rust con Candle para la inferencia acústica; ORT en CPU exclusivamente para el modelo g2pW opcional.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio ocupa 5,8 GB, por lo que se requiere espacio suficiente para los recursos y para los pesos upstream descargados por separado.

## Comparativa con modelos similares

| Aspecto | TaleChime Resources | Kokoro (upstream) | IndexTTS (upstream) | CosyVoice3 (upstream) |
|---|---|---|---|---|
| Tipo de artefacto | Recursos de runtime y componentes convertidos | Modelo TTS con pesos | Modelo TTS con pesos | Modelo TTS con pesos |
| Parámetros | no disponible | no disponible | no disponible | no disponible |
| Contexto | no aplica | no aplica | no aplica | no aplica |
| Idiomas | zh | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha |
| Licencia | Mixta por componente | según upstream | bilibili Model Use License Agreement | según upstream |
| Disponibilidad | Pública, sin gate | según upstream | según upstream | según upstream |

La comparación se limita a los datos aportados; no se dispone de cifras de rendimiento comparables para estos motores en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo listo para usar: no contiene pesos acústicos completos ni SDK, y la publicación no implica síntesis correcta ni aceptación de escucha.
- Licencia mixta: IndexTTS retiene el bilibili Model Use License Agreement y no está bajo Apache-2.0; es obligatorio revisar los términos por componente antes de uso comercial.
- Idioma restringido al chino mandarín; el caso mixto inglés está declarado no soportado.
- Riesgo de procedencia: los pesos originales y packs de voz deben obtenerse de repositorios upstream fijados, con sus propios términos.
- Validación parcial: la aceptación acústica, de dispositivo y de escucha queda fuera del alcance de esta publicación.
- Sin datos públicos de benchmarks, latencia, throughput ni requisitos de VRAM.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez de adopción no demostrada.
- El modelo g2pW opcional requiere descarga separada del ONNX oficial y su vocabulario BERT desde upstream.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yexiyue/talechime-resources
- Licencias por componente: https://huggingface.co/yexiyue/talechime-resources/blob/main/README.md#verified-runtime-components-v3
- NOTICE del frontend Kokoro: https://huggingface.co/yexiyue/talechime-resources/blob/main/kokoro/misaki-zh-v1/NOTICE.md
- Manifiesto del frontend Kokoro: https://huggingface.co/yexiyue/talechime-resources/blob/main/kokoro/misaki-zh-v1/manifest.json
