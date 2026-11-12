# TheStageAI/pocket-tts-100m-ru

## Resumen

pocket-tts-100m-ru es un modelo de síntesis de voz (text-to-speech) en ruso de 100 millones de parámetros, publicado por TheStageAI como conjunto de motores Core ML optimizados para la Neural Engine (ANE) de los chips Apple. Se trata de un fine-tune del modelo ArtShtorm/Shtorm-PocketTTS-RU (a su vez derivado de kyutai/pocket-tts), empaquetado en formato propietario para su uso dentro del SDK de Apple de TheStage bajo el identificador `pocket-tts` y el idioma de bundle `ru`.

El modelo resuelve el problema de ejecutar TTS neuronal en ruso íntegramente en dispositivo (on-device) en macOS e iOS, sin depender de servicios en la nube. Para ello combina un flow LM de 6 capas con dimensión 1024 y cabecera de flujo LSD que se ejecuta en fp16 con capas transformer palettizadas a 6 bits (g8), junto con un decodificador Mimi en fp32 que corre en CPU. El resultado se distribuye como un archivo `engines.zip` de 143 MB con motores cifrados mediante QLPA.

Es relevante ahora porque demuestra la viabilidad de desplegar TTS de calidad en hardware de consumo Apple con un modelo de solo 100M de parámetros, aunque con una restricción importante: el texto de entrada debe incluir marcas de acentuación (acento agudo combinante sobre la vocal tónica, por ejemplo «Здра́вствуйте»), tal como se entrenó; el texto sin acentos se pronuncia con acento extranjero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow LM (6 capas transformer, d=1024, cabecera de flujo LSD) + decodificador Mimi; motores Core ML para ANE (flow LM) y CPU (Mimi) |
| Parametros totales | 100M (aproximado, segun nombre del modelo y model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Flow LM en fp16 con capas transformer palettizadas a 6 bits (g8); decodificador Mimi en fp32 |
| Idiomas soportados | ruso (ru) |
| Licencia | cc-by-4.0 |
| Formato de pesos | Motores Core ML empaquetados en `engines.zip` (143 MB), cifrados con QLPA; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de kyutai/pocket-tts: un flow LM de 6 capas transformer con dimensión oculta 1024 y una cabecera de flujo LSD que genera representaciones latentes de audio, acoplado a un decodificador Mimi que convierte esas representaciones en forma de onda. En esta distribución concreta, el flow LM se compila para la Neural Engine de Apple en fp16 con las capas transformer palettizadas a 6 bits (formato g8), mientras que el decodificador Mimi se ejecuta en CPU en fp32. El modelo base es el fine-tune ruso «fast» de 6 capas de ArtShtorm (Shtorm-PocketTTS-RU).

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus ruso, ni sobre si se aplicaron etapas de RLHF o DPO. La model card sí especifica una característica crítica del entrenamiento: el texto de entrada debe llevar marcas de acentuación (acento agudo combinante sobre la vocal tónica), lo que indica que el modelo fue entrenado con texto acentuado y depende de esa información para una pronunciación nativa correcta.

## Capacidades

- Síntesis de voz en ruso a partir de texto, con salida de audio generada por el decodificador Mimi.
- Ejecución on-device en Apple Silicon mediante Core ML, con el flow LM en la Neural Engine y el decodificador Mimi en CPU.
- Soporte de múltiples voces predefinidas: azelma (por defecto), alba, charles, cosette, javert y marius.
- Control de pronunciación mediante marcas de acentuación en el texto de entrada (acento agudo combinante sobre la vocal tónica).
- Integración con el SDK de Apple de TheStage bajo el tipo de modelo `pocket-tts` y bundle de idioma `ru`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Lectura por voz en aplicaciones iOS y macOS: el modelo puede integrarse en apps nativas para leer textos en ruso sin conexión, aprovechando la ejecución en ANE y el tamaño reducido de 100M de parámetros.
- Asistentes de accesibilidad: conversión de texto a voz para usuarios con discapacidad visual en dispositivos Apple, con latencia baja al ejecutarse localmente y sin enviar datos a servidores externos.
- Audiolibros y contenido editorial en ruso: generación de narración con las seis voces disponibles, preprocesando el texto para insertar marcas de acentuación antes de la síntesis.
- Aprendizaje de idiomas: reproducción de pronunciación rusa con acentuación controlada, útil en apps educativas que necesitan señalar la vocal tónica de cada palabra.
- Interfaces conversacionales locales: integración en asistentes de voz para macOS/iOS que requieran privacidad total, al no depender de APIs de TTS en la nube.
- Prototipado de productos de voz en el ecosistema Apple: uso del SDK de TheStage para validar experiencias de TTS ruso antes de escalar a infraestructura propia.
- Sistemas de navegación o avisos por voz en ruso dentro de apps Apple, con reproducción de mensajes cortos generados dinámicamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: chips Apple con Neural Engine (macOS e iOS); el flow LM se ejecuta en ANE y el decodificador Mimi en CPU.
- No requiere GPU dedicada ni VRAM discreta: el cómputo se reparte entre ANE y CPU del SoC Apple.
- El paquete de motores ocupa 143 MB (`engines.zip`), con un repositorio total de 0,6 GB.
- Despliegue mediante el SDK de Apple de TheStage (`model_type: pocket-tts`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- No se dispone de datos de latencia ni throughput publicados.
- Los motores están cifrados con QLPA, por lo que su uso requiere el entorno del SDK de TheStage.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| pocket-tts-100m-ru (TheStageAI) | 100M (aprox.) | Ruso | no disponible | cc-by-4.0 | Core ML / ANE, motores cifrados QLPA |
| ArtShtorm/Shtorm-PocketTTS-RU | no disponible (fine-tune «fast» de 6 capas) | Ruso | no disponible | cc-by-4.0 | Pesos del modelo base (no especificado en la informacion disponible) |
| kyutai/pocket-tts | no disponible | Inglés (referencia) | no disponible | no disponible en la informacion proporcionada | Modelo original de kyutai |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El texto de entrada debe incluir marcas de acentuación (acento agudo combinante sobre la vocal tónica); sin ellas, la pronunciación suena con acento extranjero.
- Solo soporta ruso; no se documentan otros idiomas.
- Las voces incluidas son clips de referencia en inglés de Kyutai codificados por este modelo; el autor no distribuye un prompt nativo en ruso, lo que puede afectar al timbre o naturalidad esperados.
- Los motores están cifrados con QLPA y empaquetados para el SDK de TheStage, lo que limita su uso fuera de ese entorno y dificulta la inspección o modificación del modelo.
- No se distribuyen pesos en safetensors ni GGUF, lo que restringe opciones de despliegue alternativas.
- No hay información publicada sobre sesgos, tasa de alucinación o calidad subjetiva (MOS) del audio generado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación por parte de la comunidad.
- La licencia cc-by-4.0 permite uso comercial con atribución, pero debe verificarse la compatibilidad con las condiciones del SDK de TheStage y del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheStageAI/pocket-tts-100m-ru
- Modelo base (ArtShtorm/Shtorm-PocketTTS-RU): https://huggingface.co/ArtShtorm/Shtorm-PocketTTS-RU
- Modelo original de kyutai: https://huggingface.co/kyutai/pocket-tts
