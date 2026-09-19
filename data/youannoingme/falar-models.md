# youannoingme/falar-models

## Resumen

falar-models es un repositorio de artefactos derivados publicado por el usuario youannoingme en Hugging Face, no un modelo entrenado desde cero. Su proposito es empaquetar todos los ficheros que necesita la aplicacion de traduccion offline Falar (anteriormente AgentTranslator) para funcionar sin conexion entre portugues de Brasil y ruso, incluyendo los modelos de traduccion automatica, las voces de sintesis de voz y los datos auxiliares de fraseologia.

El repositorio no contiene pesos propios: redistribuye una exportacion a ONNX int8 de los modelos Helsinki-NLP opus-mt-tc-big-pt-zle y opus-mt-tc-big-zle-pt junto con su tokenizador, dos voces Piper (dmitri para ruso y faber para portugues) procedentes de paquetes de sherpa-onnx, un corpus de frases extraido de Tatoeba con su diccionario de frecuencias y un manifest.json que permite a la aplicacion y a la herramienta tools/models_fetch.py reconstruir el conjunto completo.

Es relevante como ejemplo de distribucion de un traductor neuronal en formato ONNX int8 listo para ejecutarse en CPU y en dispositivos sin GPU, con licencias permisivas (CC-BY-4.0, CC0, CC-BY 2.0 FR). El repositorio ocupa 1,3 GB y, en el momento de la consulta, registra 0 descargas y 0 "likes", por lo que no cuenta con validacion alguna por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en el repositorio; los modelos subyacentes pertenecen a la familia OPUS-MT de Helsinki-NLP (traduccion neuronal encoder-decoder) |
| Parametros totales | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (exportacion ONNX mediante optimum) para los modelos de traduccion; las voces TTS se distribuyen en el formato de Piper |
| Idiomas soportados | Portugues (pt-BR) y ruso (ru), en ambos sentidos |
| Licencia | cc-by-4.0 para el repositorio; componentes con licencias propias: CC0 (voces Piper), CC-BY 2.0 FR (datos de Tatoeba), CC-BY-4.0 (modelos OPUS-MT) |
| Formato de pesos | ONNX (int8), ZIP (voces Piper), TSV/TXT/JSON (datos textuales) |
| Tamano del repositorio | 1,3 GB |
| Pipeline declarado | translation |
| Fecha de creacion / actualizacion | 2026-09-19 / 2026-09-19 |

## Arquitectura y entrenamiento

El repositorio no describe ninguna arquitectura propia ni proceso de entrenamiento. El componente de traduccion automatica es una exportacion a ONNX int8, realizada con optimum, de los modelos Helsinki-NLP opus-mt-tc-big-pt-zle y opus-mt-tc-big-zle-pt, desarrollados por Helsinki-NLP dentro del proyecto OPUS-MT. Se trata, por tanto, de una conversion de formato y cuantizacion, no de un reentrenamiento: los pesos, el vocabulario y el tokenizador proceden integramente de los modelos originales.

La model card no aporta informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO ni ninguna innovacion tecnica adicional. Tampoco se documenta el proceso de calibracion empleado para la cuantizacion int8. Los restantes artefactos (voces Piper, corpus de Tatoeba, diccionario de frecuencias y manifest.json) son recursos de soporte para la aplicacion, no componentes entrenados por el autor del repositorio.

## Capacidades

- Traduccion automatica bidireccional portugues de Brasil ↔ ruso mediante modelos OPUS-MT exportados a ONNX int8.
- Tokenizacion integrada para ambos modelos de traduccion.
- Sintesis de voz (TTS) en ruso con la voz dmitri y en portugues con la voz faber, ambas de Piper.
- Fraseologia de apoyo para conversacion basica: corpus de frases de Tatoeba (phrasebook_tatoeba.tsv) y diccionario de frecuencias (common_words.txt).
- Ejecucion completamente offline: el manifest.json permite descargar y ensamblar el conjunto sin dependencias de red en tiempo de inferencia.
- Integracion con la aplicacion Falar y con el script tools/models_fetch.py para la recuperacion automatizada de modelos.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision ni audio de entrada.
- No se documentan capacidades multilingues mas alla del par pt-BR ↔ ru.

## Casos de uso

- Traduccion offline en aplicaciones de escritorio o moviles: el conjunto ONNX int8 y las voces Piper permiten construir un traductor pt-BR ↔ ru que funciona sin conexion, adecuado para viajeros o usuarios con conectividad limitada.
- Traduccion de voz en tiempo real: combinando el modelo de traduccion con el TTS de Piper se puede montar un pipeline de traduccion de voz (ASR externo + MT + TTS) para conversaciones cara a cara entre hablantes de portugues y ruso.
- Despliegue en entornos aislados (air-gapped): al no requerir llamadas a servicios externos y caber en 1,3 GB, el conjunto puede instalarse en equipos de hospitales, plantas industriales o instalaciones sin acceso a internet.
- Localizacion de documentacion y correspondencia: traduccion de correos, manuales y textos administrativos simples entre portugues y ruso, con revision humana posterior dado que no hay benchmarks publicados de calidad.
- Aplicaciones de aprendizaje de idiomas: el phrasebook derivado de Tatoeba y el diccionario de frecuencias sirven como material base para ejercicios, tarjetas de vocabulario y practicas de conversacion guiada.
- Integracion en herramientas de soporte al cliente: traduccion de tickets y mensajes entre equipos de atencion en Brasil y Rusia, ejecutada en local para evitar enviar datos personales a terceros.
- Empaquetado para distribucion de software: el manifest.json y models_fetch.py facilitan incluir el traductor como dependencia reproducible en una aplicacion de terceros, respetando las licencias de cada componente.
- Prototipado e investigacion en traduccion de bajos recursos: sirve como punto de partida para comparar el comportamiento de una exportacion int8 frente al modelo OPUS-MT original en fp32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas BLEU, chrF, COMET ni evaluaciones humanas, y tampoco se documenta el impacto de la cuantizacion int8 sobre la calidad de traduccion respecto a los modelos OPUS-MT originales.

## Requisitos de hardware

- VRAM estimada: no disponible. Al tratarse de exportaciones ONNX int8 y de voces TTS ligeras, el conjunto esta pensado para ejecutarse en CPU, sin necesidad de GPU.
- GPU recomendadas: no aplica; no se documenta ningun requisito de aceleracion por GPU.
- Compatibilidad con GPU de consumo: no documentada. Cualquier GPU compatible con ONNX Runtime o con sherpa-onnx podria utilizarse, pero no hay datos de rendimiento al respecto.
- Opciones de despliegue: ONNX Runtime (formato nativo de los modelos de traduccion), sherpa-onnx para las voces Piper, y la propia aplicacion Falar con tools/models_fetch.py. vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que no se trata de un modelo generativo de lenguaje.
- Latencia y throughput: no disponibles.
- Espacio en disco: aproximadamente 1,3 GB para el repositorio completo, incluyendo modelos, voces y datos textuales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| falar-models (este repositorio) | No disponible | No disponible | pt-BR ↔ ru | cc-by-4.0 (con componentes CC0 y CC-BY 2.0 FR) | ONNX int8, ZIP, TSV/TXT/JSON | Hugging Face, 0 descargas |
| Helsinki-NLP opus-mt-tc-big-pt-zle / -zle-pt | No disponible | No disponible | pt-BR ↔ ru | cc-by-4.0 | safetensors / PyTorch | Hugging Face; es el modelo de origen de este repositorio |
| NLLB-200 (Meta) | No disponible | No disponible | Multilingue (cobertura amplia) | No verificada en este analisis | safetensors / PyTorch | Hugging Face |
| M2M-100 (Meta) | No disponible | No disponible | Multilingue (cobertura amplia) | No verificada en este analisis | safetensors / PyTorch | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada. Las filas de NLLB-200 y M2M-100 se incluyen unicamente como referencia de categoria (traduccion neuronal multilingue); sus parametros, contexto y licencias no han sido verificados en el repositorio analizado.

## Limitaciones y advertencias

- El repositorio no contiene un modelo entrenado por su autor, sino artefactos derivados de terceros; cualquier problema de calidad se hereda de los modelos OPUS-MT originales y de la cuantizacion aplicada.
- No se han publicado benchmarks ni evaluaciones de calidad para el par pt-BR ↔ ru en este repositorio.
- El repositorio registra 0 descargas y 0 "likes", por lo que carece de validacion, mantenimiento comunitario o historial de incidencias.
- La cuantizacion a int8 puede degradar la calidad de traduccion frente a los pesos originales en fp32, especialmente en terminologia especializada, nombres propios y cifras.
- Cobertura limitada a portugues de Brasil y ruso; no se documenta soporte para portugues europeo ni para ningun otro idioma.
- Riesgo de alucinacion y de errores de fidelidad inherente a los sistemas de traduccion neuronal: salidas fluidas pero incorrectas, omisiones o invenciones en textos ambiguos, tecnicos o con jerga.
- Licencias mixtas: cada componente conserva su propia licencia (CC-BY-4.0 de los modelos OPUS-MT, CC0 de las voces Piper, CC-BY 2.0 FR de los datos de Tatoeba). Es obligatorio mantener la atribucion correspondiente en cualquier redistribucion, aunque el conjunto permita uso comercial.
- Las fechas de creacion y actualizacion del repositorio (2026-09-19) no coinciden con un historial de mantenimiento verificable; conviene comprobar el estado del repositorio antes de usarlo en produccion.
- No se documentan requisitos de seguridad, filtrado de contenido ni comportamiento del modelo ante entradas maliciosas.
- No apto para sustituir traduccion jurada, medica o legal sin revision humana.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/youannoingme/falar-models
- Modelos de origen citados en la model card: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-pt-zle y https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-zle-pt
- Helsinki-NLP: https://huggingface.co/Helsinki-NLP
- Proyecto OPUS: https://opus.nlpl.eu/
- Optimum (herramienta de exportacion a ONNX): https://github.com/huggingface/optimum
- sherpa-onnx (origen de las voces Piper empaquetadas): https://github.com/k2-fsa/sherpa-onnx
- Piper (sintesis de voz): https://github.com/rhasspy/piper
- Tatoeba (origen del corpus de frases): https://tatoeba.org/
- La busqueda web realizada no devolvio ningun resultado relevante sobre este repositorio, sus autores o sus componentes; los enlaces anteriores proceden de las referencias citadas en la propia model card.
