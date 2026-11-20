# SZLHOLDINGS/salad-ring-ouro-l30

## Resumen

`SZLHOLDINGS/salad-ring-ouro-l30` es un artefacto de modelo publicado por la organizacion SZLHOLDINGS dentro de lo que el autor denomina su "estate" de IA gobernada: un catalogo de modelos, datasets y Spaces con trazabilidad a fuente y resultados verificables mediante recibos de auditoria. El repositorio se presenta como un "trained artifact in the governed factory", es decir, un modelo entrenado dentro de su pipeline interno, pero la model card no documenta ni la arquitectura, ni el tamano, ni el dataset de entrenamiento, ni el proceso de alineamiento.

La informacion publica disponible es practicamente nula desde el punto de vista tecnico. No se especifican parametros, longitud de contexto, tokenizador, idiomas, licencia ni formato de pesos. La propia model card declara explicitamente que cualquier afirmacion sobre entrenamiento o evaluacion que no aparezca en sus ficheros de recibo debe considerarse "UNKNOWN", y que no se afirma ningun numero de benchmark mas alla de lo medido en una auditoria fechada. El repositorio no incluye esos recibos en la informacion proporcionada.

Por tanto, esta ficha se limita a documentar lo que el autor afirma sobre el artefacto y a marcar como "no disponible" todo aquello que no se puede verificar. Cualquier uso en produccion exigiria inspeccionar directamente los ficheros del repositorio (pesos, tokenizador, config y recibos) antes de tomar decisiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la model card ni en los metadatos de Hugging Face. El autor no indica si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura hibrida o cualquier otra variante. Tampoco se documenta el numero de parametros, la longitud de contexto nativa, el vocabulario del tokenizador ni el esquema de atencion.

Respecto al entrenamiento, la model card remite a "receipt files" dentro del "estate mesh" del autor para cualquier afirmacion sobre datos, tokens, composicion del dataset o tecnicas de alineamiento (RLHF, DPO, etc.). Esos recibos no forman parte de la informacion proporcionada, por lo que no es posible confirmar ni el volumen de tokens de entrenamiento ni si hubo fases de instruccion o preferencia. La unica afirmacion verificable es que el artefacto se genero dentro de un pipeline descrito como "governed factory" y que la tarjeta se genero automaticamente con la herramienta `estate-cards weaver v0.1.0` el 2026-11-20T05:00:35Z.

## Capacidades

- Generacion de texto: no confirmada; la model card no describe tareas soportadas.
- Razonamiento, codigo o matematicas: no disponible.
- Vision, audio u otras modalidades: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo "thinking" o cualquier capacidad especial: no disponible.

En ausencia de documentacion tecnica, no es posible afirmar que el modelo soporte ninguna capacidad concreta. La unica informacion estructural es que se trata de un artefacto de tipo "model" dentro del catalogo del autor.

## Casos de uso

No es posible recomendar casos de uso concretos sin conocer arquitectura, tamano, contexto, licencia y capacidades del modelo. Cualquier aplicacion practica requeriria primero verificar esos datos inspeccionando el repositorio. A modo de orientacion sobre que habria que comprobar antes de plantear un caso de uso:

- Despliegue en atencion al cliente: requiere confirmar longitud de contexto, idiomas soportados y licencia de uso comercial, ninguno de los cuales esta documentado.
- Generacion de codigo en CI/CD: requiere verificar si el modelo ha sido entrenado o ajustado para codigo y si soporta tool calling; no hay evidencia de ello.
- RAG sobre documentacion interna: requiere conocer la ventana de contexto y el tokenizador; no disponible.
- Clasificacion o extraccion de entidades: requiere confirmar si es un modelo generativo o discriminativo y su formato de salida; no disponible.
- Fine-tuning sobre dominio propio: requiere conocer la licencia y el formato de pesos (safetensors, GGUF, etc.); no disponible.
- Evaluacion comparativa interna: requiere disponer de los recibos de auditoria citados por el autor, que no se incluyen en la informacion proporcionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo medido en una auditoria fechada (2026-11-20T03:48:04Z) y que los datos viven en ficheros de recibo no incluidos aqui.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el numero de parametros).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; se desconoce el formato de pesos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se puede establecer una comparativa fiable sin conocer el tamano, la arquitectura y la licencia del modelo, y la model card no ofrece ninguno de esos datos. Cualquier comparacion con alternativas de la misma categoria seria especulativa.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se declaran parametros, contexto, idiomas, licencia ni formato de pesos, lo que impide evaluar el modelo de forma objetiva.
- Licencia no especificada: no se puede asumir uso comercial permitido; hay que verificar los terminos en el repositorio antes de cualquier despliegue.
- Riesgo de alucinacion y sesgos: desconocidos, al no haber informacion sobre datos de entrenamiento ni evaluaciones.
- Trazabilidad incompleta: el autor remite a "receipt files" y a un "estate mesh" externos que no se incluyen en la informacion proporcionada; sin ellos, las afirmaciones de la model card no son verificables.
- Cero adopcion observable: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni idiomas, lo que sugiere un artefacto sin uso publico documentado.
- Fechas de creacion y actualizacion (2026-11-18 y 2026-11-20) coherentes con la generacion automatica de la tarjeta, pero sin evidencia adicional sobre el contenido real del repositorio.
- No apto para produccion sin auditoria previa del repositorio (pesos, config, tokenizador y recibos).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l30
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (referenciada en la model card): https://github.com/szl-holdings
- Herramienta de generacion de tarjetas (referenciada): https://github.com/szl-holdings/estate-cards
