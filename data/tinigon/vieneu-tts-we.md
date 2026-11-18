# Tinigon/vieneu-tts-we

## Resumen

VieNeu-TTS v3 Turbo — browser pack es un empaquetado de ficheros del modelo de síntesis de voz VieNeu-TTS v3 Turbo, preparado por el usuario Tinigon para que el modelo pueda ejecutarse íntegramente en un navegador web mediante onnxruntime-web y WebAssembly. No se ha reentrenado ningún peso: el paquete redistribuye los pesos originales del modelo acústico, el tokenizador y las voces predefinidas del proyecto upstream VieNeu-TTS v3 Turbo, junto con el decodificador de códec de audio MOSS-Audio-Tokenizer-Nano-ONNX y el módulo de normalización de texto y grafema-a-fonema sea-g2p.

El interés de este repositorio no reside en el modelo en sí, sino en el formato de distribución: convierte un pipeline de TTS que normalmente requeriría Python y un entorno de servidor en un artefacto ejecutable del lado del cliente. Los pesos se almacenan como ficheros externos en float16 para reducir a la mitad la descarga y se expanden a float32 en el navegador antes de crear las sesiones de ONNX Runtime. El modelo está orientado exclusivamente al idioma vietnamita y se distribuye con licencia Apache-2.0.

El repositorio ocupa 0,3 GB y no registra descargas ni interacciones en el momento de redactar esta ficha. La información técnica disponible proviene de la model card del autor y de los enlaces a los repositorios upstream; no se han publicado resultados de benchmarks ni métricas de calidad de síntesis en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo acústico de TTS (VieNeu-TTS v3 Turbo) exportado a ONNX, con decodificador de códec de audio neuronal (MOSS-Audio-Tokenizer-Nano) y módulo G2P (sea-g2p) compilado a WebAssembly |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de síntesis de voz, no de texto) |
| Tipos de cuantizacion | Pesos externos en float16 (`turbo/*.f16`), expandidos a float32 en el navegador; arrays auxiliares en float32 (`text_emb.f32`, `xvec.f32`); diccionario G2P comprimido con gzip (`sea_g2p.dictz`) |
| Idiomas soportados | Vietnamita (`vi`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX con datos externos en float16; WebAssembly (`.wasm`) para el módulo G2P; JSON para voces y manifiesto |

## Arquitectura y entrenamiento

El paquete redistribuye el modelo acústico de VieNeu-TTS v3 Turbo en formato ONNX. La modificación principal sobre el modelo upstream es la creación de `turbo/vieneu_acoustic_heads.onnx`, que parte de `vieneu_acoustic_cached.onnx` y añade cinco nodos al grafo para calcular los logits de un codebook: una operación `Gather` de la última posición y una `MatMul` con la tabla de embeddings del codebook. Según el autor, en Python ese producto sería una llamada a NumPy, pero en un navegador debe residir dentro del grafo para ser rápido. La tabla de embeddings asociada se almacena como dato externo en `vieneu_acoustic_heads.f16`.

Los pesos externos `turbo/*.f16` se guardan en float16, lo que reduce a la mitad la descarga; el navegador los expande a float32 antes de crear las sesiones de ONNX Runtime. El autor indica que el backbone y la tabla de embeddings ya eran valores float16 en el modelo upstream, por lo que esa parte de la conversión es sin pérdida, mientras que el decodificador de códec se redondea una vez. El decodificador de audio procede de MOSS-Audio-Tokenizer-Nano-ONNX. La normalización de texto y la conversión de grafema a fonema se realizan con sea-g2p 0.10.0, compilado para `wasm32-unknown-unknown` a través de su ABI de C, con un parche menor para permitir entregar el diccionario como bytes en lugar de como fichero mapeado en memoria; el diccionario (`sea_g2p.bin` upstream) se distribuye comprimido con gzip como `g2p/sea_g2p.dictz`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo upstream. Tampoco se detalla la arquitectura interna del modelo acústico (tipo de transformer, número de capas o dimensión oculta).

## Capacidades

- Síntesis de voz (text-to-speech) en vietnamita a partir de texto escrito.
- Normalización de texto y conversión de grafema a fonema mediante sea-g2p, necesaria para la pronunciación correcta en vietnamita.
- Voces predefinidas incluidas en `turbo/voices.json` (lista plana con los mismos valores que el fichero upstream `voices_v3_turbo.json`).
- Ejecución completa en el navegador del cliente mediante onnxruntime-web y WebAssembly, sin backend Python.
- Decodificación de audio a través del códec neuronal MOSS-Audio-Tokenizer-Nano.
- No se indica soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio de entrada.
- No se indica capacidad multilingüe: el único idioma declarado es el vietnamita.

## Casos de uso

- Síntesis de voz en aplicaciones web sin backend: el paquete permite generar audio directamente en el navegador con onnxruntime-web, eliminando la necesidad de desplegar un servidor de inferencia y reduciendo la latencia de red percibida por el usuario.
- Lectura de contenido en vietnamita para accesibilidad: artículos, documentación o interfaces pueden convertirse a voz en el cliente para usuarios con discapacidad visual, sin enviar el texto a un servicio externo.
- Aprendizaje de idiomas: aplicaciones de estudio del vietnamita pueden generar pronunciaciones de palabras y frases con las voces predefinidas incluidas en `voices.json`, usando la conversión G2P para una articulación consistente.
- Asistentes conversacionales en el navegador: integración de la salida de voz en chatbots o asistentes que ya se ejecutan del lado del cliente, manteniendo la privacidad del texto del usuario al no salir del dispositivo.
- Prototipado y demos: al ser un artefacto de 0,3 GB con manifiesto SHA-256 (`v1/manifest.json`), resulta adecuado para demos técnicas de TTS en web y para validar pipelines de audio en WebAssembly antes de invertir en infraestructura.
- Generación de audio para contenido editorial en vietnamita: narración de boletines, resúmenes o avisos en aplicaciones de noticias, con la ventaja de que los pesos en float16 reducen la descarga inicial a la mitad respecto al modelo upstream.
- Distribución offline o de baja conectividad: una vez cargados los ficheros, la síntesis puede ejecutarse localmente en el navegador, lo que resulta útil en entornos con red limitada o requisitos de residencia de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ejecutarse en el navegador mediante WebAssembly, el consumo depende de la memoria del dispositivo cliente y de la expansión de los pesos float16 a float32 durante la creación de las sesiones.
- GPU recomendadas: no disponible. No se especifica aceleración por GPU (WebGPU u otras) en la información proporcionada; el empaquetado se describe para onnxruntime-web con WebAssembly.
- Compatibilidad con GPU de consumo: no confirmada. El requisito principal es un navegador compatible con onnxruntime-web y WebAssembly, además de capacidad de memoria suficiente para cargar los ficheros del paquete (0,3 GB en el repositorio).
- Opciones de despliegue: onnxruntime-web con WebAssembly en el navegador; el modelo upstream VieNeu-TTS v3 Turbo puede desplegarse por separado en Python si se necesita un entorno de servidor, aunque este repositorio no lo documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| VieNeu-TTS v3 Turbo — browser pack (este repositorio) | no disponible | no aplica (TTS) | Vietnamita | Apache-2.0 | ONNX + WebAssembly en navegador |
| VieNeu-TTS v3 Turbo (upstream) | no disponible | no aplica (TTS) | Vietnamita | Apache-2.0 | Pesos upstream, ejecución en Python |
| MOSS-Audio-Tokenizer-Nano-ONNX | no disponible | no aplica (códec de audio) | no disponible | Apache-2.0 | ONNX |
| sea-g2p | no disponible | no aplica (G2P) | no disponible | Apache-2.0 | WASM / librería |

No se dispone de datos de rendimiento comparativo entre estos componentes ni con otros sistemas de TTS en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta vietnamita; no se declara cobertura de otros idiomas.
- No se han publicado benchmarks de calidad de síntesis (naturalidad, inteligibilidad, MOS) en la información disponible, por lo que no es posible evaluar su rendimiento frente a alternativas.
- Al ser un reempaquetado, cualquier limitación del modelo upstream VieNeu-TTS v3 Turbo se hereda sin cambios; el autor no documenta correcciones de calidad.
- La conversión del decodificador de códec a float16 implica un redondeo adicional respecto al modelo upstream, según reconoce el propio autor.
- La ejecución en WebAssembly puede tener un rendimiento inferior al de una implementación nativa con GPU; no se aportan cifras de latencia.
- El repositorio no registra descargas ni interacciones, lo que limita la evidencia de uso en producción.
- Aunque la licencia es Apache-2.0, conviene verificar las licencias de los componentes upstream citados (VieNeu-TTS, MOSS-Audio-Tokenizer-Nano-ONNX y sea-g2p), todas declaradas Apache-2.0 en la model card.
- Riesgo de alucinación y sesgos: no se documentan en la información proporcionada; en TTS, los principales riesgos son errores de pronunciación derivados del módulo G2P y artefactos acústicos del códec.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Tinigon/vieneu-tts-we
- Modelo upstream VieNeu-TTS v3 Turbo: https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo
- Repositorio GitHub de VieNeu-TTS: https://github.com/pnnbao97/VieNeu-TTS
- Códec de audio MOSS-Audio-Tokenizer-Nano-ONNX: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX
- Repositorio GitHub de sea-g2p: https://github.com/pnnbao97/sea-g2p
