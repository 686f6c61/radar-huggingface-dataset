# USC-PSI-Lab/psi-model

## Resumen

psi-model es un modelo publicado en HuggingFace por USC-PSI-Lab (Universidad de Santiago de Compostela, grupo PSI Lab). El repositorio contiene pesos en formato safetensors con un tamano total de 1464,8 GB, lo que situa al modelo en la categoria de modelos de gran escala, aunque no se ha publicado informacion sobre su arquitectura concreta, numero de parametros ni configuracion de entrenamiento.

La ficha tecnica oficial del repositorio no incluye pipeline declarado, licencia, idiomas soportados ni documentacion de uso. El unico contenido verificable es el identificador del modelo, el autor, el formato de pesos y el volumen del repositorio. Cualquier dato adicional sobre capacidades, entrenamiento o rendimiento no esta disponible en la informacion proporcionada.

Dado el estado del repositorio (0 descargas, 10 likes, creado en febrero de 2026 y actualizado en noviembre de 2026), se trata de una publicacion reciente y sin adopcion documentada. Esta ficha se limita a reflejar los datos verificables y marca explicitamente como "no disponible" todo aquello que no ha sido publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo (transformer, MoE, SSM o hibrida), el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El repositorio no incluye model card con detalles tecnicos ni referencias a papers o blogs asociados.

El unico dato estructural disponible es el formato de pesos (safetensors) y el tamano del repositorio (1464,8 GB), que sugiere pesos de gran volumen, posiblemente en precision alta o con multiples variantes. No es posible inferir el numero de parametros a partir del tamano del repo sin conocer la precision de los pesos y el numero de ficheros incluidos.

## Capacidades

- No se han documentado capacidades especificas en la informacion disponible.
- No hay evidencia publicada de soporte de tool calling o function calling.
- No hay evidencia publicada de capacidades de agente o razonamiento multi-paso.
- No hay informacion sobre capacidades multilingues.
- No hay informacion sobre modos especiales (thinking, vision, audio).

## Casos de uso

No es posible proponer casos de uso concretos y realistas sin informacion sobre las capacidades, el contexto, los idiomas y la licencia del modelo. Cualquier escenario de aplicacion seria especulativo y no estaria respaldado por datos publicados. Se recomienda consultar la model card del repositorio o contactar con USC-PSI-Lab antes de plantear un uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del numero de parametros y la cuantizacion, datos no publicados).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no determinable con los datos actuales; el tamano del repositorio (1464,8 GB) sugiere que la inferencia en GPU de consumo requeriria cuantizacion agresiva y aun asi podria no ser viable.
- Opciones de despliegue: no disponible (no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre parametros, contexto, rendimiento ni licencia del modelo, por lo que no es posible establecer una comparacion rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de model card: no hay documentacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- Riesgo de alucinacion: no evaluado ni documentado.
- Licencia no especificada: no se puede confirmar el uso comercial ni las restricciones de redistribucion.
- Idiomas no declarados: no se puede garantizar cobertura multilingue.
- Contexto no declarado: imposible planificar integraciones que dependan de ventanas largas.
- Repositorio de gran tamano (1464,8 GB): la descarga y el almacenamiento requieren infraestructura significativa.
- Sin adopcion documentada (0 descargas): no hay evidencia de la comunidad sobre su comportamiento en produccion.
- Se recomienda verificar la integridad de los pesos y la presencia de ficheros de configuracion antes de cualquier despliegue.

## Enlaces

- HuggingFace: https://huggingface.co/USC-PSI-Lab/psi-model
