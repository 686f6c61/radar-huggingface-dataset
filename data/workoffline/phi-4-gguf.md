# WorkOffline/phi-4-GGUF

## Resumen

`WorkOffline/phi-4-GGUF` es un espejo no oficial del modelo Phi-4 de Microsoft en formato GGUF, publicado por el usuario WorkOffline para que su aplicación homónima pueda descargar los pesos desde un único punto, fijados a una revisión concreta y verificados mediante SHA-256. No se trata de un modelo nuevo ni de una conversión propia: el repositorio contiene una copia byte a byte del fichero `phi-4-Q4_K.gguf` publicado por Microsoft en `microsoft/phi-4-gguf`, renombrado como `phi-4-Q4_K_M.gguf`. Todo el mérito del modelo corresponde a Microsoft y el de la cuantización al equipo que publicó los GGUF originales.

El modelo subyacente, Phi-4, es un transformer decoder-only denso de 14.659.507.200 parámetros (aproximadamente 14,7 mil millones), entrenado por Microsoft Research con un enfoque intensivo en calidad de datos sintéticos y curvas de datos, orientado a razonamiento, matemáticas y código. La licencia MIT del modelo original permite uso comercial sin restricciones significativas, lo que lo convierte en una opción atractiva para despliegues locales.

La relevancia de este repositorio concreto es logística más que técnica: ofrece una única descarga cuantizada en Q4_K_M (unos 9,05 GB) con verificación de integridad documentada, lo que simplifica el despliegue en entornos con conectividad limitada o con requisitos de reproducibilidad. Para cualquier evaluación técnica del modelo conviene remitirse a las fuentes originales de Microsoft, ya que este espejo no añade documentación propia sobre capacidades, entrenamiento o benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Phi-4, Microsoft) |
| Parametros totales | 14.659.507.200 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado en este repo) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | MIT |
| Formato de pesos | GGUF (`phi-4-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

La arquitectura corresponde a Phi-4 de Microsoft: un transformer decoder-only denso de aproximadamente 14,7 mil millones de parámetros. El repositorio espejo no aporta información propia sobre la composición del dataset, el número de tokens de entrenamiento ni las etapas de alineación (RLHF/DPO) del modelo original; esos detalles deben consultarse en la documentación de `microsoft/phi-4`. La única intervención técnica documentada aquí es la cuantización a Q4_K_M realizada por Microsoft en `microsoft/phi-4-gguf`, que reduce el peso a 9.053.114.560 bytes manteniendo los bytes idénticos al fichero upstream.

El repositorio no introduce innovaciones arquitectónicas ni de decodificación; su función es servir como espejo reproducible. El hash SHA-256 documentado (`5652b9be0ea4ae2842130d04fe31bc869fcb99a2b7106c53b4e754a343fd688f`) permite verificar que el fichero descargado coincide exactamente con la revisión `6edc2ef6664b739a8e11e62f2672ff6afe0c15ac` del repositorio oficial de GGUF.

## Capacidades

- Generación de texto conversacional en formato chat, según la etiqueta `conversational` del repositorio.
- Razonamiento y matemáticas: capacidades heredadas del modelo Phi-4 original (no documentadas en este espejo).
- Generación de código: capacidad propia de Phi-4, no verificada en la documentación de este repositorio.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere uso con infraestructura de inferencia estándar.
- Ejecución local offline: el formato GGUF permite inferencia en CPU y GPU sin conexión.
- Tool calling, agentes, visión, audio y modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo sin conexión: el fichero GGUF de 9,05 GB puede cargarse con llama.cpp u Ollama en equipos con 16 GB de RAM o VRAM, lo que encaja con escenarios de trabajo en campo o entornos air-gapped.
- Reproducibilidad de experimentos: el SHA-256 documentado permite fijar una versión exacta del modelo en pipelines de evaluación, evitando deriva entre ejecuciones.
- Asistente conversacional de escritorio: la naturaleza cuantizada y el formato GGUF lo hacen adecuado para integrarse en aplicaciones de escritorio que requieran un modelo local sin dependencia de API.
- Prototipado rápido de aplicaciones de razonamiento: Phi-4 está orientado a tareas de matemáticas y lógica, por lo que sirve para validar flujos de resolución de problemas antes de escalar a modelos mayores.
- Distribución controlada en organizaciones: al ser un espejo con licencia MIT y hash verificado, facilita la aprobación interna de dependencias en entornos con políticas estrictas de procedencia de artefactos.
- Inferencia en CPU para servicios de baja concurrencia: la cuantización Q4_K_M permite ejecutar el modelo sin GPU dedicada, útil para herramientas internas de generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio espejo no incluye métricas propias; para datos de MMLU, HumanEval, GSM8K u otros, debe consultarse la documentación de `microsoft/phi-4`.

## Requisitos de hardware

- VRAM/RAM estimada para Q4_K_M: en torno a 9-10 GB para los pesos, más overhead de contexto; se recomienda un mínimo de 12 GB de memoria unificada o VRAM.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), A100 y H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090).
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; la etiqueta `endpoints_compatible` sugiere compatibilidad con servidores de inferencia estándar.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| phi-4-GGUF (este repo) | 14,7 B | no disponible | MIT | GGUF Q4_K_M | Espejo no oficial de Microsoft Phi-4 |
| microsoft/phi-4 | 14,7 B | no disponible | MIT | safetensors | Modelo original, referencia para benchmarks |
| microsoft/phi-4-gguf | 14,7 B | no disponible | MIT | GGUF | Fuente upstream de la cuantización |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer diferencias cuantitativas con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un espejo no oficial: no hay garantía de mantenimiento, actualización ni soporte por parte de Microsoft.
- Solo se publica una cuantización (Q4_K_M); no hay versiones Q8, Q5 o Q2 en este repositorio.
- La model card no documenta sesgos, tasas de alucinación ni limitaciones idiomáticas del modelo original.
- No se especifica la longitud de contexto soportada en la información disponible, lo que impide planificar despliegues con ventanas largas sin consultar la fuente original.
- La licencia MIT permite uso comercial, pero conviene verificar los términos del modelo base en `microsoft/phi-4` antes de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- La fecha de creación (2026-11-10) es posterior a la de los modelos de referencia habituales; verificar que la revisión upstream citada siga disponible.

## Enlaces

- Repositorio espejo: https://huggingface.co/WorkOffline/phi-4-GGUF
- Modelo original: https://huggingface.co/microsoft/phi-4
- GGUF oficial: https://huggingface.co/microsoft/phi-4-gguf
- Licencia MIT del modelo base: https://huggingface.co/microsoft/phi-4/blob/main/LICENSE
- Revisión upstream citada: https://huggingface.co/microsoft/phi-4-gguf/blob/6edc2ef6664b739a8e11e62f2672ff6afe0c15ac/LICENSE
