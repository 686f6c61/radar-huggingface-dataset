# UraionLabs/Uraion-Cyber-V1.0-MLX-oQ5e

## Resumen

Uraion Cyber V1.0 MLX oQ5e es una cuantizacion de 5 bits del modelo Uraion Cyber V1.0, un transformer de mezcla de expertos (MoE) de aproximadamente 35.000 millones de parametros totales con unos 3.000 millones activos por token, desarrollado por Uraion Labs. El modelo base esta especializado en seguridad defensiva y trabajo agentico: deteccion de vulnerabilidades, auditoria de codigo, generacion de parches y reconocimiento de codigo correcto cuando no hay fallo. Esta version concreta esta empaquetada en formato MLX safetensors para ejecucion local en Apple Silicon mediante el runtime oMLX o cualquier runtime mlx-vlm compatible con Qwen3.5 MoE.

La relevancia de esta publicacion radica en que traslada un modelo de seguridad de 35B-A3B al ecosistema local de Apple Silicon con una cuantizacion de matriz de importancia mejorada (oQ5e), reduciendo el peso a 26,22 GB y manteniendo la torre de vision, el tokenizer, la plantilla de chat y los pesos MTP del checkpoint original. El contexto arquitectonico alcanza los 262.144 tokens, aunque el autor advierte explicitamente de que ese limite no constituye una garantia de memoria utilizable en la practica.

La ficha del modelo base reporta resultados medidos sobre los pesos BF16 servidos con vLLM 0.33.0, no sobre esta build MLX. Por tanto, cualquier cifra de rendimiento debe interpretarse como referencia del modelo padre y no como validacion de esta cuantizacion concreta. La licencia es MIT y el idioma declarado es unicamente ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), derivado de la familia Qwen3.5/Qwen3.6 |
| Parametros totales | 35.951.822.704 (aproximadamente 35B) |
| Parametros activos | Aproximadamente 3B por token (256 expertos, 8 enrutados por token) |
| Longitud de contexto | 262.144 tokens (limite arquitectonico, no garantia de memoria) |
| Tipos de cuantizacion | oQ5e (5 bits, matriz de importancia mejorada de oMLX 0.7.4.dev1); la familia incluye oQ4e, oQ6e, oQ8e y niveles de 2 y 3 bits |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | MLX safetensors (peso del repo: 26,22 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con 256 expertos y 8 enrutados por token, lo que da un total cercano a 35B de parametros con unos 3B activos por inferencia. Incorpora torre de vision (pipeline `image-text-to-text`), plantilla de chat y tokenizer preservados del checkpoint fuente, y conserva los pesos MTP (multi-token prediction) si estaban presentes en el original. La cuantizacion oQ5e aplica precision mixta calibrada con una matriz de importancia mejorada generada localmente por oMLX 0.7.4.dev1, en lugar de un ancho de bits fraccional uniforme.

No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineacion. La model card remite a la ficha del modelo padre BF16 para la metodologia de evaluacion completa, los resultados de seguridad en conjuntos reservados, los limites y la documentacion de seguridad. Tampoco se detallan innovaciones adicionales como decodificacion especulativa o atencion lineal mas alla del uso de MTP.

## Capacidades

- Generacion de texto conversacional con modo de razonamiento explicito (thinking), desactivable mediante `chat_template_kwargs.enable_thinking`.
- Razonamiento multi-paso orientado a tareas de seguridad y analisis de codigo.
- Deteccion de vulnerabilidades y auditoria de codigo, incluyendo la capacidad de declarar codigo como correcto cuando no hay fallo explotable.
- Generacion de parches y propuestas de correccion.
- Soporte de tool calling y function calling, con resultados reportados en BFCL.
- Comportamiento agentico en episodios multi-paso con uso de herramientas y entorno de sandbox.
- Capacidades de vision al conservar la torre visual del checkpoint original (entrada image-text-to-text).
- Capacidades de codigo general, evaluadas con HumanEval+ en el modelo padre.
- Multilingue: no disponible; el unico idioma declarado es ingles.

## Casos de uso

- Auditoria de codigo en local: el modelo puede recibir un fichero de servicio y devolver un veredicto razonado sobre si existe un fallo explotable, nombrando la funcion afectada y la peticion que lo demuestra, o confirmando que el codigo es solido. Es adecuado por su entrenamiento especifico en seguridad defensiva y su capacidad de evitar falsos positivos.
- Triaje de vulnerabilidades en pipelines de CI/CD: integrado mediante la API compatible con OpenAI que expone oMLX, puede analizar diffs o ficheros modificados antes de fusionar y emitir un informe estructurado con hallazgos y parches sugeridos.
- Generacion de parches de seguridad: a partir de un hallazgo previo, el modelo propone la correccion y puede razonar sobre el impacto del cambio, lo que encaja en flujos de remediacion asistida.
- Agente de respuesta a incidentes: con soporte de tool calling y 262.144 tokens de contexto arquitectonico, puede mantener el estado de una investigacion multi-paso consultando logs, repositorios y sistemas externos a traves de funciones.
- Revision de codigo asistida en estaciones de trabajo Apple Silicon: al ejecutarse con oMLX o mlx-vlm sobre Metal, permite desplegar el modelo en un Mac Studio o MacBook Pro de gama alta sin depender de servicios en la nube, lo que resulta relevante para codigo sensible que no debe salir de la organizacion.
- Analisis de capturas o diagramas de arquitectura: gracias a la torre de vision conservada, puede procesar imagenes junto a texto, por ejemplo para revisar diagramas de flujo de datos o capturas de configuracion en una evaluacion de seguridad.
- Formacion y concienciacion interna: el modelo puede explicar por que un fragmento de codigo es vulnerable y como demostrarlo en un sandbox, sirviendo como apoyo a equipos de AppSec.

## Benchmarks y rendimiento

Los resultados disponibles corresponden al modelo padre BF16 servido con vLLM 0.33.0 (cuantizacion FP8 de pesos en carga), no a esta build MLX oQ5e. Se incluyen como referencia.

| Prueba (modelo padre en vLLM) | Uraion Cyber V1.0 | Qwen3.6-35B-A3B | Uraion Cyber preview |
|---|---:|---:|---:|
| Tareas de seguridad reservadas, respuesta unica (758) | 681 (89,8%) | 603 (79,6%) | 610 (80,5%) |
| Tareas de seguridad de confirmacion nuevas (387) | 352 (91,0%) | 309 (79,8%) | no disponible |
| Episodios agenticos reservados (200) | 190 (95,0%) | 175 (87,5%) | 164 (83,2%) |
| Episodios agenticos nuevos (200) | 191 (95,5%) | 172 (86,0%) | no disponible |
| Codigo correcto reportado como correcto (122) | 92 (75,4%) | 55 (45,1%) | 59 (48,4%) |
| IFEval prompt, estricto (541) | 425 (78,6%) | 390 (72,1%) | 441 (81,5%) |
| BFCL (400) | 368 (92,0%) | 364 (91,0%) | 358 (89,5%) |
| HumanEval+ (164) | 149 (90,9%) | 148 (90,2%) | 148 (90,2%) |
| Peticiones daninas rechazadas (30) | 30 | 30 | 30 |

No se han publicado resultados de benchmarks medidos sobre esta cuantizacion MLX oQ5e en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: los pesos ocupan 26,22 GB; hay que anadir memoria para el runtime, activaciones y cache KV. El autor no publica una cifra cerrada de memoria total necesaria.
- Contexto y memoria: 262.144 tokens es el limite arquitectonico; el contexto maximo utilizable depende de la memoria disponible y de la configuracion del runtime. No se garantiza alcanzar el limite.
- Plataforma: exclusivamente Apple Silicon con Metal; no es ejecutable en GPU NVIDIA o AMD a traves de este repositorio.
- Equipos recomendados: configuraciones de memoria unificada alta (por ejemplo, Mac Studio o MacBook Pro con 32 GB o mas); con 32 GB el margen para contexto y cache es limitado, por lo que se recomiendan 64 GB o mas para contextos extensos.
- Cabe en GPU de consumo: no aplica en el sentido tradicional; en Apple Silicon depende de la memoria unificada del equipo. No hay soporte para RTX 4090, A100 o H100 con estos pesos MLX.
- Despliegue: oMLX (version actualizada) mediante `omlx serve`, o un runtime mlx-vlm compatible con Qwen3.5 MoE. Expone una API compatible con OpenAI en `/v1`.
- Alternativas de cuantizacion: oQ4e como punto de partida equilibrado; oQ6e y oQ8e priorizan fidelidad; 2 y 3 bits reducen huella de memoria.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato/plataforma | Rendimiento de referencia |
|---|---:|---:|---:|---|---|---|
| Uraion Cyber V1.0 MLX oQ5e | ~35B | ~3B | 262.144 | MIT | MLX safetensors, Apple Silicon | No medido en esta build |
| Uraion Cyber V1.0 (BF16) | ~35B | ~3B | 262.144 | MIT | BF16, vLLM | 89,8% seguridad reservada; 95,0% episodios agenticos |
| Qwen3.6-35B-A3B | ~35B | ~3B | no disponible | no disponible | no disponible | 79,6% seguridad reservada; 87,5% episodios agenticos |
| Uraion Cyber preview | no disponible | no disponible | no disponible | no disponible | no disponible | 80,5% seguridad reservada; 83,2% episodios agenticos |

## Limitaciones y advertencias

- Los benchmarks publicados corresponden al modelo padre BF16 en vLLM con cuantizacion FP8 en carga; no se han medido sobre esta build MLX oQ5e. Las cuantizaciones de menor precision (especialmente 2 y 3 bits) sacrifican calidad a cambio de memoria.
- El modelo solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente critico en seguridad: un falso negativo (declarar codigo seguro cuando no lo es) o un falso positivo pueden tener consecuencias operativas. El propio modelo padre reporta un 75,4% de acierto al identificar codigo correcto como correcto, lo que deja margen de error relevante.
- La licencia MIT permite uso comercial, pero la model card remite a la documentacion de seguridad y limites del modelo padre, que conviene revisar antes de desplegar en produccion.
- El limite de contexto de 262.144 tokens es arquitectonico, no una garantia de memoria; en equipos con menos memoria unificada el contexto efectivo sera mucho menor.
- Dependencia de un runtime especifico (oMLX actualizado o mlx-vlm con soporte Qwen3.5 MoE); versiones antiguas pueden no cargar el modelo correctamente.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad sobre esta cuantizacion.
- No se dispone de informacion sobre sesgos especificos, composicion del dataset de entrenamiento ni procesos de alineacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ5e
- Modelo padre BF16: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0
- Licencia: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ5e/blob/main/LICENSE
- Informe de cuantizacion por matriz de importancia: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ5e/blob/main/oq_imatrix_report.json
- Informacion de cuantizacion: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ5e/blob/main/quantization_info.json
- Smoke test: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ5e/blob/main/smoke_test.json
- Sumas SHA256: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ5e/blob/main/SHA256SUMS
- Sitio del autor: https://uraionlabs.com/
