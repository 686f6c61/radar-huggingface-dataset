# SZLHOLDINGS/doctrine-math-r2-pilot

## Resumen

doctrine-math-r2-pilot es un modelo publicado por SZLHOLDINGS dentro de su denominado "governed-AI estate", un conjunto de artefactos (modelos, datasets y Spaces) que la organizacion presenta como trazables y verificables mediante ficheros de recibo (receipts). El modelo se distribuye en formato safetensors con licencia Apache 2.0 y ocupa aproximadamente 0,1 GB en el repositorio de Hugging Face, lo que sugiere un artefacto de pequeno tamano, probablemente un piloto o una adaptacion ligera mas que un modelo de gran escala.

La model card es deliberadamente parca en especificaciones tecnicas: no declara arquitectura, numero de parametros, longitud de contexto ni idiomas soportados. El autor indica explicitamente que cualquier afirmacion sobre entrenamiento o evaluacion reside en ficheros de recibo externos a la card, y que lo no documentado se etiqueta como UNKNOWN. Esta politica de "no inventar metricas" es coherente con el enfoque de gobernanza que promociona la organizacion, pero deja al evaluador sin datos verificables en la propia ficha de Hugging Face.

Por tanto, esta ficha se limita a reflejar lo que la informacion disponible permite afirmar. El interes actual del modelo es limitado para produccion (7 descargas, 0 likes, sin pipeline declarado), y su relevancia es mas documental —como ejemplo de publicacion con trazabilidad declarada— que tecnica. Cualquier dato de rendimiento, contexto o composicion del entrenamiento debe considerarse no disponible hasta consultar los recibos del estate.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes declaradas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | ~0,1 GB |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-11-16 |
| Ultima actualizacion | 2026-11-25 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la model card ni en los metadatos de Hugging Face. No se indica si se trata de un transformer denso, un modelo MoE, una arquitectura hibrida o una adaptacion (por ejemplo, un fine-tuning o un adaptador) sobre una base previa. El nombre "doctrine-math-r2-pilot" y el tamano del repositorio (0,1 GB) apuntan a un artefacto pequeno, compatible con un piloto de ajuste sobre matematicas, pero esto es una inferencia a partir del nombre y del tamano, no un dato declarado.

Tampoco se especifican el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO o ajuste supervisado. La model card remite a los "receipt files" del estate para cualquier afirmacion de entrenamiento o evaluacion, y declara explicitamente que lo no receiptado es UNKNOWN. No se describe ninguna innovacion tecnica (atencion lineal, decodificacion especulativa, modos de razonamiento extendido, etc.).

## Capacidades

- Generacion de texto: no confirmada en la informacion disponible; el pipeline no esta declarado.
- Razonamiento matematico: el nombre del modelo sugiere orientacion a matematicas, pero no hay evidencia declarada de resultados ni de capacidades concretas.
- Codigo, vision, audio: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas esta vacio en los metadatos).
- Modos especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

Dado que no se declaran capacidades, contexto ni rendimiento, los casos de uso solo pueden plantearse como escenarios hipoteticos sujetos a validacion previa con los recibos del estate:

- Evaluacion de gobernanza de artefactos: usar el repositorio como ejemplo de publicacion con trazabilidad declarada (receipts, auditoria fechada, etiquetado MEASURED/REPORTED/UNKNOWN) en un estudio interno sobre practicas de publicacion de modelos.
- Prueba de concepto en matematicas: si los recibos confirman capacidad de resolucion de problemas aritmeticos o algebraicos, emplearlo como piloto en un entorno controlado antes de adoptar un modelo mayor.
- Integracion en pipelines de validacion de licencias: al ser Apache 2.0, puede incorporarse en herramientas internas de analisis de repositorios de Hugging Face sin friccion legal inmediata.
- Docencia y formacion: utilizar la model card como caso practico de documentacion incompleta y de la diferencia entre metricas declaradas y metricas verificadas.
- Experimentacion con safetensors de bajo peso: probar flujos de carga, conversion y despliegue en entornos con recursos limitados, dado el tamano reducido del repositorio.
- Auditoria de reproducibilidad: contrastar los ficheros de recibo citados con el contenido real del repositorio para verificar la politica de honestidad que declara el autor.

En ningun caso se recomienda su uso en produccion sin antes consultar los recibos y validar el modelo con un conjunto de evaluacion propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ninguna cifra de benchmark mas alla de lo medido en una auditoria fechada, y que dichas mediciones residen en ficheros de recibo externos no incluidos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con un repositorio de ~0,1 GB, la huella en memoria seria previsiblemente inferior a 1 GB en precision completa, pero no se confirma el numero de parametros.
- GPU recomendadas: no disponible. Por el tamano del artefacto, cabria en cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante), pero esto es una estimacion basada en el tamano del fichero, no un dato declarado.
- Compatibilidad con GPU consumer: probable por tamano, no confirmada.
- Opciones de despliegue: no disponible. Al distribuirse en safetensors, requeriria un runtime compatible con la arquitectura subyacente (transformers, vLLM, TGI, llama.cpp si se generan cuantizaciones GGUF), pero no se especifica ninguna.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica la arquitectura ni el tamano en parametros, por lo que no es posible establecer una comparacion rigurosa con alternativas de la misma categoria. Cualquier comparacion seria especulativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| doctrine-math-r2-pilot | no disponible | no disponible | Apache 2.0 | Hugging Face (7 descargas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: sin arquitectura, parametros, contexto ni idiomas declarados, no es posible evaluar su idoneidad para ninguna tarea concreta.
- Sin benchmarks verificables en la propia card: las metricas, si existen, residen en ficheros de recibo externos que no se han proporcionado.
- Riesgo de alucinacion: desconocido; no hay evaluacion publicada.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto o idioma: no documentadas; el campo de idiomas esta vacio.
- Licencia: Apache 2.0 declarada, pero la propia card advierte que la etiqueta se fijo por decision interna del estate ("rights-call per estate dataset rank-1 precedent") y que no se reclama evidencia de licencia upstream por fichero. Esto introduce incertidumbre sobre la procedencia real de los pesos y conviene verificarlo antes de un uso comercial.
- Madurez: 7 descargas, 0 likes y ausencia de pipeline declarado indican un artefacto practicamente sin adopcion ni validacion externa.
- Uso en produccion: desaconsejado sin auditoria previa de los recibos, validacion propia y confirmacion de la licencia de los datos y pesos de origen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/doctrine-math-r2-pilot
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica citada): https://github.com/szl-holdings
- Repositorio de la herramienta de generacion de cards: https://github.com/szl-holdings/estate-cards
