# Viren321/Navo-AI-Gemma4-E2B-GGUF

## Resumen

Navo-AI-Gemma4-E2B-GGUF es una cuantizacion en formato GGUF publicada por el usuario Viren321 en Hugging Face, derivada del modelo `unsloth/gemma-4-E2B-it-GGUF`, que a su vez es una version cuantizada del Gemma 4 E2B instruct de Google. El repositorio contiene pesos de 4.647.450.147 parametros totales (segun los metadatos de safetensors) en un paquete de 3,4 GB, lo que sugiere cuantizaciones de baja precision orientadas a inferencia en hardware de consumo.

El modelo se distribuye bajo licencia Apache 2.0 y declara soporte para ingles (en) e hindi (hi). La model card publicada es practicamente vacia: solo incluye metadatos YAML de licencia, idiomas y etiquetas, sin descripcion tecnica, sin datos de entrenamiento y sin benchmarks. Por tanto, toda la informacion sustantiva sobre arquitectura, contexto y capacidades debe inferirse del modelo base, no del repositorio en si.

Su relevancia practica es limitada pero concreta: ofrece una via de despliegue local de un modelo Gemma de ultima generacion en formato GGUF, compatible con runtimes como llama.cpp u Ollama, y con soporte declarado de endpoints. Para equipos que necesiten inferencia offline en castellano o ingles con hardware modesto, puede ser un punto de partida, aunque la ausencia de documentacion y de validacion publica exige precaucion antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base Gemma 4 E2B; no documentada en el repo) |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo es GGUF; no se detallan los niveles Q4, Q5, Q8, etc.) |
| Idiomas soportados | en, hi |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No hay informacion publicada en el repositorio sobre la arquitectura interna del modelo. El nombre del modelo base (`gemma-4-E2B-it-GGUF`) indica que se trata de una variante instruct de la familia Gemma 4 de Google, con el sufijo "E2B" que sugiere una configuracion de aproximadamente 2.000 millones de parametros efectivos, aunque el recuento de safetensors reporta 4.647.450.147 parametros totales. Esta discrepancia es habitual en modelos con componentes adicionales (embeddings, cabezas de salida o posibles mezclas de expertos) y no puede resolverse sin la model card original.

Tampoco se documentan los datos de entrenamiento: numero de tokens, composicion del corpus, uso de RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El unico dato cierto es que el autor ha tomado los pesos GGUF de Unsloth y los ha republicado bajo una identidad propia ("Navo AI", "Nex AI"), sin anadir informacion sobre el proceso de cuantizacion aplicado ni sobre posibles ajustes finos.

## Capacidades

- Generacion de texto conversacional en ingles e hindi, segun los idiomas declarados en los metadatos.
- Modo instruct heredado del modelo base (`-it`), orientado a seguir instrucciones y mantener dialogos multi-turno.
- Compatibilidad con endpoints declarada en las etiquetas (`endpoints_compatible`), lo que sugiere integracion con infraestructuras de inferencia estandar.
- Soporte de tool calling y function calling: no disponible en la documentacion del repositorio.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no disponible.
- Modo thinking explicito: no disponible.
- Capacidades multilingues adicionales al ingles y al hindi: no disponibles.

## Casos de uso

- Despliegue local de un asistente conversacional: al estar en formato GGUF, el modelo puede cargarse en llama.cpp u Ollama y ejecutarse en una estacion de trabajo sin conexion, gestionando dialogos multi-turno en ingles o hindi con un peso de 3,4 GB en disco.
- Prototipado rapido de chatbots para mercados indios: el soporte declarado de hindi permite construir asistentes de atencion al cliente en ese idioma, aunque la calidad real no esta validada por benchmarks publicos.
- Inferencia en hardware de consumo: con 4.647 millones de parametros y cuantizacion GGUF, es viable en GPUs de gama media (8-12 GB de VRAM) o incluso en CPU, lo que facilita pruebas de concepto sin presupuesto de nube.
- Generacion de texto asistida en entornos air-gapped: sectores con requisitos de confidencialidad pueden desplegarlo en servidores aislados, siempre que se acepte la falta de documentacion sobre sesgos y alucinaciones.
- Integracion en pipelines de CI/CD para pruebas de regresion de prompts: el formato GGUF y la compatibilidad con endpoints permiten levantar un servidor de inferencia ligero en contenedores para evaluar cambios de plantillas o de logica de negocio.
- Educacion e investigacion: util como banco de pruebas para estudiar el comportamiento de cuantizaciones de Gemma 4 en tareas de razonamiento basico, comparando con el modelo base de Unsloth.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la model card se limita a metadatos YAML.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de 4.647 millones de parametros en cuantizacion de 4 bits ocupa aproximadamente 2,5-3 GB de pesos, mas overhead de contexto y cache KV.
- GPU recomendadas: no documentadas por el autor. Por tamano, cabria en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y GPUs de datacenter como A100 o H100, aunque no hay validacion publicada.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con 8 GB o mas de VRAM en cuantizaciones de 4-5 bits; en CPU tambien es viable con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF como llama-cpp-python o text-generation-webui. No se confirma soporte de vLLM ni TGI, que requieren formatos distintos.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Navo-AI-Gemma4-E2B-GGUF | 4.647.450.147 | no disponible | apache-2.0 | GGUF | Republicacion sin documentacion tecnica |
| unsloth/gemma-4-E2B-it-GGUF (base) | no disponible | no disponible | no disponible | GGUF | Modelo de origen, mantenido por Unsloth |
| Gemma 4 E2B instruct (original) | no disponible | no disponible | no disponible | safetensors | Modelo de referencia de Google |

No se dispone de datos de rendimiento comparativo entre estas variantes, por lo que la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card no describe arquitectura, entrenamiento, contexto ni limitaciones, lo que impide evaluar su idoneidad con rigor.
- Sesgos desconocidos: al no documentarse la composicion del dataset de entrenamiento, no es posible anticipar sesgos de genero, etnicos, religiosos o politicos.
- Riesgo de alucinacion no cuantificado: no hay evaluaciones publicadas de fidelidad factual ni de tasas de alucinacion.
- Cobertura idiomatica limitada: solo se declaran ingles e hindi; el rendimiento en castellano no esta garantizado y probablemente sea deficiente.
- Contexto desconocido: se desconoce la longitud maxima de contexto, lo que complica el diseno de aplicaciones con documentos largos.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; la responsabilidad recae en el integrador.
- Republicacion no oficial: el repositorio no procede del equipo de Google ni de Unsloth, por lo que no hay compromiso de mantenimiento ni de actualizaciones.
- Trazabilidad de la cuantizacion: no se especifica el nivel de cuantizacion ni el proceso aplicado, lo que dificulta reproducir resultados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Viren321/Navo-AI-Gemma4-E2B-GGUF
- Modelo base en Hugging Face: https://huggingface.co/unsloth/gemma-4-E2B-it-GGUF
- DOI asociado: https://doi.org/10.57967/hf/11676
