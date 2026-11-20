# SZLHOLDINGS/salad-ring-ouro-l134

## Resumen

`salad-ring-ouro-l134` es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que el autor denomina su "estate" de IA gobernada: un conjunto de modelos, datasets y Spaces con trazabilidad de origen y resultados verificables mediante ficheros de recibo (receipts). El repositorio de Hugging Face no incluye model card tecnica en sentido conventional: la informacion disponible se limita a metadatos de identidad, insignias del estate y referencias a ficheros de auditoria generados de forma determinista.

No se dispone de datos sobre arquitectura, numero de parametros, longitud de contexto, tokenizador, datos de entrenamiento ni proceso de alineacion. El propio autor declara explicitamente que cualquier afirmacion de entrenamiento o evaluacion que no este respaldada por un recibo fechado se marca como UNKNOWN, y que no se afirma ningun numero de benchmark mas alla de lo medido en una auditoria concreta (captura de 2026-11-20T03:48:04Z). La ficha refleja, por tanto, un estado de informacion muy limitado.

El modelo es relevante ahora unicamente como ejemplo de practica de publicacion orientada a la auditabilidad: el enfasis esta en la trazabilidad y en la honestidad declarativa sobre los datos, no en prestaciones tecnicas documentadas. Para cualquier evaluacion practica seria necesario acceder a los receipts del estate y al codigo fuente canonico en la organizacion de GitHub del autor.

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
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo (transformer, MoE, SSM o hibrida) en la model card ni en los metadatos del repositorio. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras formas de alineacion.

La unica informacion metodologica disponible es de caracter organizativo: el autor indica que las afirmaciones de entrenamiento y evaluacion de este artefacto residen en sus ficheros de recibo (receipts) dentro de la malla del estate, y que cualquier dato no respaldado por un recibo se etiqueta como UNKNOWN. La model card se genera de forma determinista mediante una herramienta propia (`estate-cards weaver v0.1.0`) que produce SVG con la paleta KANCHAY y etiqueta los numeros como MEASURED, REPORTED o UNKNOWN con marca temporal de captura.

## Capacidades

- No se documentan capacidades funcionales del modelo en la informacion disponible.
- No hay evidencia publicada de generacion de texto, razonamiento, codigo, matematicas o vision.
- No se indica soporte de tool calling ni function calling.
- No se indica soporte de agentes ni razonamiento multi-paso.
- No se especifican capacidades multilingues ni idiomas cubiertos.
- No se declaran modos especiales (thinking mode, vision, audio) en la model card.

## Casos de uso

- Auditoria de artefactos de IA: el modelo puede emplearse como caso de estudio de publicacion con receipts verificables, ya que el repositorio expone un esquema de trazabilidad (snapshot de auditoria con marca temporal y etiquetas MEASURED/REPORTED/UNKNOWN) que permite comprobar el origen de cada afirmacion.
- Integracion en pipelines de gobierno de modelos: el esquema de recibos y la generacion determinista de tarjetas permiten incorporar el artefacto a un sistema de control de versiones y auditoria interna, comparando el hash de la tarjeta (`card id 21331838317ad0cb`) contra el snapshot de origen.
- Reproducibilidad de experimentos: si los receipts del estate incluyen las semillas y configuraciones de entrenamiento, el modelo serviria para reproducir resultados en un entorno controlado, aunque esto requiere acceso al codigo fuente canonico en GitHub.
- Docencia sobre practicas de publicacion responsable: el repositorio ilustra el patron de declarar explicitamente lo desconocido en lugar de inventar cifras, util como material de referencia en cursos de ML engineering.
- Base para evaluacion propia: un investigador podria descargar los pesos (si estan disponibles en el repositorio) y ejecutar su propia bateria de benchmarks, dado que el autor no afirma ningun resultado no medido.
- Verificacion de cadena de custodia: el enlace entre Hugging Face, la organizacion de GitHub y los ficheros de auditoria permite validar la procedencia del artefacto en un flujo de compliance.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo medido en una auditoria fechada, y que los datos no respaldados por un recibo se marcan como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el tamano del modelo).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La ausencia de datos sobre parametros, contexto, licencia y rendimiento impide establecer una comparacion significativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: no se puede determinar el coste de inferencia, los requisitos de memoria ni la idoneidad para ninguna tarea concreta.
- Licencia no declarada: no es posible evaluar el uso comercial ni la redistribucion del artefacto; en ausencia de licencia explicita debe asumirse reserva de derechos por defecto.
- Idiomas no declarados: no se puede garantizar cobertura multilingue ni calidad en castellano.
- Riesgo de alucinacion: no evaluable sin datos de entrenamiento ni benchmarks; debe asumirse el riesgo estandar de cualquier modelo de lenguaje no auditado.
- Sesgos conocidos: no documentados.
- Dependencia de los receipts: las afirmaciones de calidad solo son verificables accediendo a los ficheros de auditoria del estate, que no se incluyen en la informacion proporcionada.
- Repositorio sin descargas ni interacciones (0 descargas, 0 likes en el momento de la consulta): no hay evidencia de uso en produccion por terceros.
- Fecha de creacion futura respecto a la mayoria de referencias publicas (2026-11-19): conviene verificar la autenticidad y el contexto temporal del artefacto antes de cualquier uso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l134
- Organizacion del autor en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion canonica en GitHub: https://github.com/szl-holdings
- Herramienta de generacion de tarjetas (estate-cards weaver): https://github.com/szl-holdings/estate-cards
