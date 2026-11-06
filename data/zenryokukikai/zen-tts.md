# Zenryokukikai/zen-tts

## Resumen

ZEN-TTS 1.2.0 es un sistema de síntesis de voz (text-to-speech) en japonés desarrollado por Zenryoku Kikai (全力機械), una empresa japonesa. Su rasgo diferencial es que todo el pipeline —desde la conversión de grafemas a fonemas (G2P) hasta el decodificador NSF a 44,1 kHz— se ejecuta íntegramente en el dispositivo: en el navegador mediante WebGPU con WebAssembly como alternativa, y en Node.js sobre CPU. No requiere servidor ni conexión a un backend de inferencia.

El modelo se distribuye como un conjunto de ficheros binarios propietarios con extensión `.ztm`, uno por voz, de unos 27,7 MB cada uno, más un modelo de lectura (G2P) compartido de 13,5 MB. El repositorio de Hugging Face ocupa 0,1 GB en total. Incluye cuatro voces (marine, hashiro, kai y kikka, en versión 1.1) y cinco estilos emocionales (neutral, happy, sad, angry, apologetic) que pueden mezclarse por proporciones y modificarse a mitad de frase.

Es relevante para desarrolladores que necesiten TTS japonés de baja latencia y sin dependencias de servidor, por ejemplo en aplicaciones web, extensiones, herramientas de accesibilidad o entornos con requisitos de privacidad. La contrapartida es una licencia restrictiva: permite el uso comercial del software y de las locuciones generadas, pero prohíbe la modificación, la redistribución y el uso de los pesos o de las salidas para entrenar, destilar o evaluar otros modelos de aprendizaje automático.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS con modelo G2P, predictor de prosodia, generador y decodificador NSF; componentes en int8 y fp16 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (predictor de prosodia y generador), fp16 (decodificador NSF) |
| Idiomas soportados | japonés (ja) |
| Licencia | ZEN-TTS License 1.0 (propietaria, uso permitido con atribución, sin modificación ni redistribución) |
| Formato de pesos | `.ztm` (formato propio, un fichero por voz) y `g2p.bin` / `g2p.json` para el modelo de lectura |
| Frecuencia de muestreo de salida | 44,1 kHz, mono |
| Voces incluidas | marine, hashiro, kai, kikka (versión 1.1) |
| Estilos emocionales | neutral, happy, sad, angry, apologetic (mezclables y modificables intra-frase) |
| Entornos de ejecucion | WebGPU, WebAssembly (fallback en navegador), Node.js sobre CPU |
| Tamano por voz | 27,7 MB (aprox. 27.650.080 bytes) |
| Tamano del modelo G2P | 13,5 MB (13.453.312 bytes) + 55 KB de metadatos JSON |

## Arquitectura y entrenamiento

La información disponible describe un pipeline modular: un modelo de lectura (G2P) que convierte texto japonés en fonemas, un predictor de prosodia, un generador acústico y un decodificador NSF (Neural Source Filter) que produce la forma de onda final a 44,1 kHz. Los pesos del predictor de prosodia y del generador se almacenan en int8, mientras que el decodificador NSF usa fp16, lo que explica el reducido tamaño de cada voz (27,7 MB). El modelo G2P se distribuye por separado y es común a las cuatro voces.

No se especifican en la información proporcionada el número de parámetros, la arquitectura interna exacta de cada componente (tipo de transformer, capas, dimensiones) ni el volumen total de datos de entrenamiento del modelo acústico. La model card sí detalla la composición del corpus de entrenamiento del modelo G2P: textos de Wikipedia en japonés (CC BY-SA), obras y rubíes de Aozora Bunko, frases de Tatoeba (CC BY), Wikinews japonés (CC BY), datos públicos de furigana de la Biblioteca Nacional de la Dieta, el CMU Pronouncing Dictionary y 12dicts para palabras inglesas, mecab-ipadic-neologd (Apache-2.0) e IPAdic 2.7.0 para lecturas léxicas. En la versión 1.2.0 se sustituyó el modelo G2P, se eliminó el diccionario de lectura integrado y se rediseñó la generación de ruido del decodificador para reducir artefactos en consonantes y sonidos aspirados.

## Capacidades

- Síntesis de voz en japonés con salida a 44,1 kHz en mono.
- Cuatro voces diferenciadas: marine (femenina suave), hashiro (masculina grave), kai (masculina de unos 40 años, registro bajo resonante) y kikka (femenina joven, timbre limpio).
- Cinco estilos emocionales combinables por proporciones (por ejemplo, 70 % happy y 30 % neutral) y modificables a mitad de frase.
- Control de velocidad de habla en el rango 0,5–1,5 y de tono en semitonos en el rango −6 a +12.
- Lectura de números (por ejemplo, 10分 como ジュップン) y de palabras en inglés (por ejemplo, Unity) gracias al modelo G2P de la versión 1.2.0.
- Ejecución sin servidor: WebGPU en navegador, WebAssembly como alternativa y CPU en Node.js.
- No incluye clonación de voz; la creación de voces adicionales se gestiona a través del fabricante.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- **Aplicaciones web con TTS en el cliente:** integración del runtime en el navegador mediante WebGPU o WebAssembly para leer contenido en japonés sin enviar texto a un servidor, lo que reduce la latencia y evita exponer datos del usuario.
- **Herramientas de accesibilidad:** lectores de pantalla, extensiones de navegador o aplicaciones de lectura que necesiten voz japonesa natural con control de velocidad y tono para adaptarse a preferencias del usuario.
- **Asistentes conversacionales y chatbots en japonés:** generación de respuestas habladas con matices emocionales (por ejemplo, tono apologetic en mensajes de error o happy en confirmaciones) mezclando estilos por proporción.
- **Contenido educativo y de aprendizaje de idiomas:** reproducción de frases con velocidad ajustable (0,5–1,5) y lectura correcta de números y términos en inglés, útil en aplicaciones de estudio de japonés.
- **Audioguías y kioscos interactivos:** despliegue en Node.js sobre CPU en dispositivos locales sin GPU dedicada, con cambios de emoción intra-frase para secciones informativas frente a advertencias.
- **Prototipado y demos offline:** el tamaño reducido (27,7 MB por voz más 13,5 MB de G2P) permite empaquetar el modelo en aplicaciones de escritorio o PWA y funcionar sin conexión.
- **Videojuegos y narrativa interactiva:** cuatro voces con estilos emocionales permiten dar voz a distintos personajes y modular la interpretación según el estado de la historia, todo dentro del propio motor o navegador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada:** no disponible; el modelo está diseñado para ejecutarse en el dispositivo y los pesos por voz ocupan 27,7 MB, por lo que la huella de memoria es muy reducida en comparación con modelos TTS de gran tamaño.
- **GPU recomendadas:** no se especifican modelos concretos; en navegador se aprovecha WebGPU cuando está disponible y se recurre a WebAssembly en caso contrario.
- **CPU:** el runtime de Node.js funciona sobre CPU, lo que permite despliegue en servidores modestos o dispositivos de usuario final.
- **Compatibilidad con GPU de consumo:** plausible por el tamaño de los pesos, pero no se detallan modelos concretos (RTX 4090, etc.) en la información proporcionada.
- **Opciones de despliegue:** paquete npm `zen-tts` instalable desde GitHub (`pnpm add github:zenryokukikai/zen-tts#v1.2.0`), con puntos de entrada `zen-tts/node` para Node.js y el runtime de navegador en `dist/index.js`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput:** no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Ejecucion en dispositivo | Licencia | Contexto / tamano |
|---|---|---|---|---|---|
| ZEN-TTS 1.2.0 | TTS neuronal con G2P y NSF | Japonés | Sí (WebGPU, WASM, CPU) | Propietaria, uso con atribución, sin modificación ni redistribución | 27,7 MB por voz + 13,5 MB G2P |
| Otros sistemas TTS japoneses open source | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos verificables sobre modelos comparables (parámetros, contexto, rendimiento o licencia), por lo que la comparativa cuantitativa se limita a las características del propio ZEN-TTS.

## Limitaciones y advertencias

- **Licencia restrictiva:** la ZEN-TTS License 1.0 permite usar el software y las locuciones generadas en aplicaciones comerciales y no comerciales, pero exige mostrar la atribución «音声合成：ZEN-TTS (https://zenryokukikai.com)» en un lugar visible para el usuario. Prohíbe la modificación, la redistribución y el uso del software, sus pesos o sus salidas para entrenar, destilar o evaluar otros modelos de aprendizaje automático. Es imprescindible revisar `LICENSE.md` antes de integrarlo en producción.
- **Idioma único:** solo soporta japonés; no se documentan capacidades multilingües más allá de la lectura de palabras inglesas aisladas por el G2P.
- **Sin clonación de voz:** no es posible crear voces nuevas a partir de muestras; el fabricante ofrece este servicio por separado.
- **Riesgo de alucinación y errores de pronunciación:** como todo sistema G2P, puede fallar en nombres propios, neologismos o kanji ambiguos; la versión 1.2.0 eliminó el diccionario de lectura integrado, lo que traslada la resolución al modelo neuronal.
- **Sesgos:** no se documentan análisis de sesgos en la información disponible; al tratarse de voces sintéticas predefinidas, el riesgo se concentra en la representación limitada de variedades dialectales y registros.
- **Dependencia del runtime:** los ficheros `.ztm` requieren el runtime de ZEN-TTS 1.2.0 o posterior; no son compatibles con herramientas estándar de inferencia.
- **Soporte WebGPU variable:** en navegadores sin WebGPU se recurre a WebAssembly, con rendimiento presumiblemente inferior (no cuantificado en la información disponible).
- **Formato propietario:** el formato `.ztm` está documentado en el repositorio de GitHub, pero no es un estándar de la industria, lo que limita la interoperabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zenryokukikai/zen-tts
- Repositorio del runtime (GitHub): https://github.com/zenryokukikai/zen-tts
- README del runtime (tag v1.2.0): https://github.com/zenryokukikai/zen-tts/tree/v1.2.0#readme
- Especificación del formato `.ztm`: https://github.com/zenryokukikai/zen-tts/blob/v1.2.0/docs/ztm-format.md
- Registro de cambios: https://github.com/zenryokukikai/zen-tts/blob/v1.2.0/CHANGELOG.md
- Licencia: https://huggingface.co/Zenryokukikai/zen-tts/blob/main/LICENSE.md
- Avisos de terceros: https://huggingface.co/Zenryokukikai/zen-tts/blob/main/THIRD_PARTY_NOTICES.md
- Sitio del fabricante: https://zenryokukikai.com
- CDN de modelos: https://tts-models.zenryoku.work/v1.2.0/
