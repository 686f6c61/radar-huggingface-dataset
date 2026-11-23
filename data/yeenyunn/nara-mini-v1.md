# YeeNyunn/nara-mini-v1

## Resumen

Nara Mini v1 es un modelo de síntesis de voz (text-to-speech) desarrollado por YeeNyunn y adaptado para birmano (my) e inglés (en). Se basa en Kokoro, un modelo TTS de 82 millones de parámetros, y añade cuatro voces predefinidas con sus correspondientes voicepacks. El modelo resuelve la necesidad de síntesis de voz de calidad para birmano, un idioma con escasa cobertura en el ecosistema TTS open source, y ofrece inferencia local tanto en CPU como en dispositivos móviles mediante exportaciones ONNX.

La relevancia actual del modelo radica en su licencia Apache 2.0, que permite uso comercial sin restricciones adicionales más allá de las obligaciones de atribución, y en su formato de despliegue ligero: el repositorio ocupa 2,8 GB e incluye pesos en safetensors de precisión completa y exportaciones ONNX con decodificador cuantizado a INT8 para móvil. La salida de audio es mono a 24 kHz, y el procesamiento de texto incorpora reglas de pronunciación birmanas, un léxico de excepciones, fonemización inglesa y normalización de números.

El modelo no dispone de parámetros publicados en la información disponible, aunque al derivar de Kokoro-82M es razonable situar la arquitectura base en ese orden de magnitud. No se especifica la longitud de contexto en tokens ni el número exacto de parámetros del checkpoint adaptado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Basada en Kokoro (TTS); módulos `bert`, `bert_encoder`, `predictor`, `text_encoder`, `decoder` |
| Parámetros totales | no disponible (modelo base Kokoro-82M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | safetensors en precisión completa; ONNX con encoder full-precision y decoder INT8 selectivamente cuantizado |
| Idiomas soportados | birmano (my), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, paquetes `.nara` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Kokoro, un sistema TTS que combina módulos de representación textual (`bert`, `bert_encoder`), un predictor de duración (`predictor`), un codificador de texto (`text_encoder`) y un decodificador de audio (`decoder`). Cada una de las cuatro voces (`shoon`, `thazin`, `ko-banyar`, `htet-myat`) utiliza su propia red y voicepack, con metadatos que aportan el vocabulario y los vectores de estilo. La configuración arquitectónica se encuentra en `config.json`, y el vocabulario, vectores de estilo y centros de bins de longitud en `onnx/<voice>/voice.json`.

Las cuatro voces se desarrollaron utilizando habla sintética generada con VoxCPM2. La documentación de la release no registra la versión exacta del checkpoint inicial de Kokoro. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El procesamiento de texto incorpora reglas de pronunciación birmanas, un léxico de excepciones, fonemización inglesa mediante Misaki y su dependencia de eSpeak, y normalización de números birmanos que convierte expresiones numéricas soportadas a palabras habladas antes de la fonemización.

## Capacidades

- Síntesis de voz en birmano e inglés con cuatro voces predefinidas: `shoon`, `thazin`, `ko-banyar` y `htet-myat`.
- Salida de audio mono a 24 kHz.
- Procesamiento de texto mixto birmano-inglés con reglas de pronunciación específicas para birmano y fonemización inglesa.
- Normalización de números según reglas de lectura birmanas, aplicable también en texto mixto.
- Inferencia local en CPU mediante ONNX, con control del número de hilos (`--threads`).
- Exportación para dispositivos móviles mediante paquetes `.nara` con grafos ONNX y metadatos, incluyendo checksums de archivos.
- Opción de preservar texto numérico sin normalizar (`--no-normalize-numbers`).
- Procesamiento de pasajes largos en fragmentos más cortos.

## Casos de uso

- Aplicaciones móviles de accesibilidad: el paquete `.nara` con ONNX e INT8 permite integrar síntesis de voz birmana en apps iOS/Android sin conexión, con un decodificador cuantizado que reduce el coste computacional en dispositivos de gama media.
- Lectura de contenido en birmano: artículos, noticias o documentos pueden convertirse a audio con pronunciación ajustada mediante el léxico de excepciones y las reglas de pronunciación del modelo, útil para usuarios con discapacidad visual o para consumo en movilidad.
- Asistentes de voz locales: la inferencia en CPU con ONNX permite desplegar un asistente de voz sin dependencia de servicios en la nube, controlando la latencia mediante el parámetro `--threads` según los núcleos disponibles.
- Localización de contenido para el mercado birmano: empresas que necesiten doblar o narrar material en birmano e inglés pueden generar audio con cuatro voces distintas, asignando voces según el tipo de contenido o el hablante.
- Prototipado de interfaces conversacionales: desarrolladores que construyan chatbots o IVR en birmano pueden integrar el modelo como capa TTS en pipelines locales, con la ventaja de la licencia Apache 2.0 para uso comercial.
- Educación y aprendizaje de idiomas: la combinación de birmano e inglés en un mismo modelo permite generar material de audio bilingüe, con normalización de números adaptada a las reglas de lectura birmanas.
- Sistemas embebidos y edge computing: la exportación ONNX con encoder full-precision y decoder INT8 está pensada para entornos con recursos limitados, donde no es viable ejecutar modelos TTS de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Al derivar de Kokoro-82M y con exportación ONNX para CPU, el modelo está diseñado para ejecutarse sin GPU.
- GPU recomendadas: no se especifican en la información disponible; el modelo está orientado a inferencia en CPU y dispositivos móviles.
- Compatibilidad con GPU de consumo: no disponible; el flujo documentado ejecuta el encoder y decoder ONNX en CPU.
- Opciones de despliegue: inferencia directa con Python 3.10 o superior mediante `synthesize.py` y ONNX Runtime en CPU; paquetes `.nara` para la app Nara; pesos safetensors para integración en otros motores.
- Latencia y throughput: no disponibles; el rendimiento depende del hardware del dispositivo, el formato de exportación y la longitud del pasaje, según la model card.
- Tamaño del repositorio: 2,8 GB, incluyendo pesos full-precision y exportaciones ONNX.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Nara Mini v1 | no disponible (base Kokoro-82M) | my, en | no disponible | Apache 2.0 | safetensors, ONNX, `.nara` | Hugging Face |
| Kokoro-82M | 82M | principalmente inglés y otros | no disponible | Apache 2.0 | safetensors, ONNX | Hugging Face (hexgrad/Kokoro-82M) |
| VoxCPM2 | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face (openbmb/VoxCPM2) |

Nara Mini v1 se diferencia de Kokoro-82M por su adaptación específica al birmano, con reglas de pronunciación, léxico de excepciones y normalización de números propias, además de cuatro voces predefinidas. VoxCPM2 se utilizó únicamente para generar el habla sintética con la que se desarrollaron las voces, no como modelo base. No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La pronunciación y la prosodia pueden variar según el texto y la mezcla de idiomas; no se garantiza consistencia en todos los casos.
- La normalización de números sigue reglas de lectura birmanas, incluso en texto mixto, lo que puede producir resultados inesperados en expresiones numéricas inglesas.
- Los pasajes largos se procesan en fragmentos más cortos, lo que puede afectar a la coherencia prosódica entre fragmentos.
- El rendimiento depende del hardware, el formato de exportación y la longitud del pasaje; no se publican métricas de latencia ni de calidad subjetiva (MOS).
- No se documenta la versión exacta del checkpoint de Kokoro utilizado como base, lo que dificulta la reproducibilidad exacta del entrenamiento.
- Las voces se generaron con habla sintética de VoxCPM2, lo que puede introducir artefactos o sesgos acústicos propios del generador.
- La licencia Apache 2.0 permite uso comercial, pero la redistribución exige conservar la licencia, incluir los avisos de atribución del archivo NOTICE (Nara Mini v1, Nara contributors, https://naraaudio.app y agradecimientos upstream), mantener los avisos de copyright en derivados en forma fuente y marcar los archivos modificados.
- Las dependencias de fonemización inglesa (Misaki y eSpeak) conservan sus propias licencias, que deben respetarse por separado.
- No se especifican sesgos demográficos o acústicos conocidos más allá de los derivados del habla sintética de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YeeNyunn/nara-mini-v1
- Sitio web de Nara Audio: https://naraaudio.app
- Kokoro-82M (modelo base): https://huggingface.co/hexgrad/Kokoro-82M
- VoxCPM2 (generador de habla sintética para las voces): https://huggingface.co/openbmb/VoxCPM2
