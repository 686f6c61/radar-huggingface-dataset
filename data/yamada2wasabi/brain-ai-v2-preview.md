# yamada2wasabi/brain-ai-v2-preview

## Resumen

brain AI v2 (プレビュー版) es un paquete de modelos y recursos linguisticos publicado por el usuario yamada2wasabi (autor identificado en la model card como "love-linux") para la aplicacion de diccionario electronico SHARP Brain. No se trata de un modelo de lenguaje convencional alojado en Hugging Face para inferencia via `transformers`, sino de un conjunto de artefactos binarios propietarios (`model.bin`, `tok.bin`, `decide.bin`, `igc.bin`) que solo funcionan dentro de la aplicacion brain AI v2, disenada para operar completamente offline en dispositivos SHARP Brain (Windows CE) y en PC con Windows de 64 bits.

El repositorio incluye dos modelos de conversacion y generacion de codigo de aproximadamente 7,2 MB cada uno, un modelo de OCR de unos 409 KB y un diccionario enciclopedico en formato TSV de aproximadamente 412 MB con cerca de 1,39 millones de entradas derivadas de Wikipedia en japones. El modelo esta etiquetado exclusivamente para japones (`ja`) y se distribuye bajo licencia CC BY-SA 4.0.

La relevancia de esta publicacion es acotada: se trata de una version preview de un componente de aplicacion, no de un modelo autonomo reutilizable. El tamano de los modelos (7,2 MB) sugiere arquitecturas muy comprimidas y cuantizadas orientadas a dispositivos con recursos extremadamente limitados, pero la model card no aporta detalles sobre arquitectura, parametros, contexto ni entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (modelos de ~7,2 MB en disco; numero de parametros no declarado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en formato binario propietario `.bin`) |
| Idiomas soportados | japones (`ja`) |
| Licencia | CC BY-SA 4.0 (modelos); diccionario derivado de Wikipedia bajo CC BY-SA |
| Formato de pesos | binario propietario (`model.bin`, `tok.bin`, `decide.bin`, `igc.bin`); no safetensors ni GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. La model card no especifica si se trata de un transformer, un modelo recurrente, un n-grama o un esquema hibrido. La presencia de cuatro ficheros separados por modelo (`model.bin`, `tok.bin`, `decide.bin`, `igc.bin`) sugiere una division funcional entre pesos del modelo, tokenizador, modulo de decision y algun componente adicional (posiblemente de generacion o control), pero el autor no documenta el proposito de cada uno mas alla de indicar que deben colocarse juntos en la misma carpeta.

Tampoco se detallan los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El unico dato relacionado con datos es el diccionario `kb.tsv`, construido a partir de titulos y primeros parrafos de articulos de Wikipedia en japones (aproximadamente 1,39 millones de entradas), que se usa presumiblemente como base de recuperacion (RAG) para busqueda enciclopedica. El modelo OCR (`ocr.bin`) reporta una tasa de acierto del 92,5 % y una tasa de error de caracteres del 11,88 % en las mediciones de desarrollo del autor, aunque no se ha verificado su funcionamiento en hardware Brain real.

## Capacidades

- Generacion de texto conversacional en japones mediante el modelo `v2/`.
- Generacion de codigo mediante el modelo `coderv1/`.
- Reconocimiento optico de caracteres (OCR) de imagenes mediante `ocr.bin`.
- Busqueda enciclopedica offline sobre el diccionario `kb.tsv` (RAG sobre Wikipedia en japones).
- Funcionamiento completamente offline, sin conexion a internet, en dispositivo y tarjeta SD.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al japones segun la etiqueta de idioma.
- Capacidades especiales (thinking mode, vision, audio): solo OCR; no se declaran otras.

## Casos de uso

- Consulta enciclopedica offline en diccionario electronico: el modelo `v2/` combinado con `kb.tsv` permite buscar y responder sobre aproximadamente 1,39 millones de entradas de Wikipedia japonesa sin conexion, adecuado para dispositivos SHARP Brain en entornos sin red.
- Asistencia conversacional en japones en dispositivos de bajos recursos: el modelo de 7,2 MB esta pensado para ejecutarse en hardware Windows CE, lo que lo hace util para interfaces de dialogo embebidas donde no cabe un modelo mayor.
- Generacion de snippets de codigo en dispositivo: `coderv1/` permite producir fragmentos de codigo en local, util para entornos educativos o de consulta rapida sin dependencia de servicios en la nube.
- Digitalizacion de texto impreso mediante OCR: `ocr.bin` permite extraer texto de imagenes capturadas en el dispositivo, con una tasa de error de caracteres reportada del 11,88 % en desarrollo, adecuada para notas y no para documentos criticos.
- Despliegue en PC Windows de 64 bits: la version PC permite probar el paquete completo fuera del hardware Brain, util para evaluacion y desarrollo de la aplicacion.
- Escenarios de privacidad estricta: al no requerir conexion, todos los datos permanecen en el dispositivo y la tarjeta SD, lo que encaja en usos donde no se permite enviar contenido a servidores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento declarado es el del OCR en fase de desarrollo: tasa de acierto del 92,5 % y tasa de error de caracteres del 11,88 %, sin verificacion en hardware Brain real.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable en el sentido convencional; los modelos ocupan aproximadamente 7,2 MB en disco cada uno y estan disenados para ejecucion en CPU.
- GPU recomendadas: no disponible; el diseno apunta a CPU en dispositivos SHARP Brain (Windows CE) y PC Windows de 64 bits.
- Compatibilidad con GPU de consumo: no disponible; no se declara soporte de aceleracion por GPU.
- Opciones de despliegue: exclusivamente la aplicacion brain AI v2 (no compatible con vLLM, llama.cpp, Ollama ni TGI, ya que usa formato binario propietario).
- Latencia y throughput: no disponibles.
- Almacenamiento: el diccionario `kb.tsv` requiere aproximadamente 412 MB adicionales; el repositorio completo ocupa 0,4 GB.
- Nota de compatibilidad: la cuarta generacion de SHARP Brain, salvo los modelos SB5 a SB7, puede no arrancar la aplicacion tal cual.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables en la informacion proporcionada: los artefactos son binarios propietarios ligados a una aplicacion concreta y no se declaran parametros, contexto ni rendimiento que permitan una comparacion con modelos de lenguaje de proposito general.

## Limitaciones y advertencias

- El paquete no funciona de forma autonoma: los ficheros solo son utilizables dentro de la aplicacion brain AI v2, cuyo binario no se incluye en el repositorio.
- Version preview: el autor la marca explicitamente como preliminar, sin garantias de estabilidad.
- El OCR no ha sido validado en hardware Brain real y su tasa de error de caracteres (11,88 %) es alta para usos criticos.
- Riesgo de alucinacion y errores en las respuestas del modelo conversacional y en los resultados de OCR; el autor recomienda verificar la informacion importante con otras fuentes.
- El diccionario refleja el estado de Wikipedia en el momento de su creacion y puede estar desactualizado.
- Idioma limitado al japones; no se declara soporte multilingue.
- Licencia CC BY-SA 4.0: permite uso comercial, pero exige atribucion a "love-linux", conservar la misma licencia en obras derivadas y compartir las modificaciones bajo los mismos terminos. El diccionario derivado de Wikipedia queda sujeto adicionalmente a CC BY-SA.
- Sin datos publicos de arquitectura, parametros ni contexto, lo que impide evaluar su calidad tecnica de forma independiente.
- Cero descargas y cero likes en el momento de la consulta, sin comunidad ni soporte documentado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yamada2wasabi/brain-ai-v2-preview
- Descarga directa del diccionario: https://huggingface.co/yamada2wasabi/brain-ai-v2-preview/resolve/main/kb.tsv
- Licencia CC BY-SA 4.0 (texto en japones): https://creativecommons.org/licenses/by-sa/4.0/deed.ja
- Wikipedia en japones (fuente del diccionario): https://ja.wikipedia.org/
