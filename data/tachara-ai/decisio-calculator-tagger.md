# tachara-ai/Decisio-calculator-tagger

## Resumen

Decisio-calculator-tagger es un modelo de clasificación de tokens (token-classification) desarrollado por Tachara AI Lab como componente auxiliar del sistema decisio, una herramienta de decisión aumentada por modelos de lenguaje. Su función concreta es etiquetar el rol semántico de cada número que aparece en un texto (cantidad, precio, duración, tasa, porcentaje, comisión, crédito, tipo impositivo o distractor), de modo que decisio pueda ensamblar esos valores en importes estructurados y realizar aritmética exacta sobre facturas, recibos o nóminas sin que el modelo generativo tenga que calcularlos.

El modelo parte de answerdotai/ModernBERT-base, un encoder transformer de 153 millones de parámetros, y se ha afinado para la tarea de etiquetado de roles numéricos. No es un modelo de propósito general: está diseñado para ejecutarse exclusivamente dentro del pipeline de decisio 0.51.0 o superior, nunca de forma autónoma, y su salida se somete a compuertas de precisión que descartan cualquier bloque aritmético si no se cumplen todas las condiciones (todos los números marcados, todos los valores presentes en el texto, coherencia entre redacción y caso, y superación de los umbrales configurados).

Su relevancia radica en el enfoque híbrido: en lugar de confiar en que un LLM haga aritmética exacta, se delega la extracción de roles a un encoder especializado y la aritmética a un módulo determinista, reduciendo el riesgo de errores de cálculo en dominios financieros y administrativos. El modelo se distribuye con licencia Apache 2.0, en formato safetensors float32, con un tamaño de repositorio de 0,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base) con cabezas de clasificación de tokens |
| Parametros totales | 153.193.791 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de ModernBERT-base; no especificada en la información proporcionada) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en float32; no se documentan otras cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT-base, un encoder transformer de 153 millones de parámetros, sobre el que se han añadido cabezas de clasificación de tokens para la tarea de etiquetado de roles numéricos. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; se trata de un fine-tuning supervisado para token-classification. Los pesos se distribuyen en float32, y el autor indica que los umbrales de decisión están ajustados sobre etiquetas en float32, siendo `--calculator-dtype float32` el valor por defecto en el servidor de decisio.

La innovación principal no reside en la arquitectura del encoder, sino en su integración dentro del sistema decisio: el tagger marca el rol de cada número y decisio ensambla esas marcas en importes estructurados, aplicando compuertas de precisión que impiden mostrar un bloque aritmético si algún número queda sin marcar, si algún valor no proviene del texto, si la redacción no concuerda con el caso o si alguna decisión no supera su umbral. El repositorio incluye `cascade_tagger.json` (conjunto de etiquetas y formato que decisio verifica al cargar) y `SHA256SUMS` (verificación de integridad de cada archivo antes de la carga).

## Capacidades

- Etiquetado de roles numéricos en textos: cantidad, precio, duración, tasa, porcentaje, comisión, crédito, tipo impositivo y distractor.
- Extracción de valores exactos para aritmética posterior (base imponible, impuesto, importes de línea).
- Integración con el lector en cascada de decisio para textos sin reglas predefinidas.
- Aplicación de compuertas de precisión: descarte de bloques aritméticos cuando no se cumplen todas las condiciones.
- Verificación de integridad de archivos mediante SHA256SUMS al cargar el modelo.
- No soporta generación de texto, razonamiento general, código, matemáticas simbólicas, visión, audio, tool calling ni agentes; su alcance es exclusivamente el etiquetado de tokens para el pipeline de decisio.

## Casos de uso

- Procesamiento de facturas: el tagger marca cada número de la factura (precio unitario, cantidad, base imponible, tipo de IVA, cuota) y decisio calcula y verifica los importes sin que un LLM tenga que hacer aritmética, reduciendo errores en la validación de facturas recibidas.
- Lectura de nóminas: identifica salario base, complementos, deducciones y retenciones en el texto de una nómina para que decisio reconstruya los importes estructurados y compruebe la coherencia de los totales.
- Procesamiento de recibos y tickets: extrae líneas de compra con sus precios y cantidades, permitiendo el desglose exacto del total y la detección de discrepancias.
- Automatización de cuentas a pagar: en un pipeline documental, el tagger alimenta a decisio con los importes de cada línea para conciliar facturas contra pedidos y detectar desviaciones de precio o cantidad.
- Extracción de condiciones financieras: en contratos o presupuestos, marca tipos de interés, porcentajes, comisiones y plazos para que decisio los estructure y los use en cálculos deterministas.
- Auditoría de documentos fiscales: al exigir que todos los números estén marcados y provengan del texto, el sistema permite auditar que ningún importe se ha inventado o inferido, lo que resulta adecuado para flujos con requisitos de trazabilidad.
- Integración como lector en cascada en servidores de decisio: despliegue mediante `python -m decisio.serve.vllm_engine` con `--calculator-reader cascade` para procesar lotes de documentos administrativos con umbrales ajustados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un encoder de 153 millones de parámetros en float32, el peso de los pesos ronda los 0,6 GB; con activaciones y overhead del runtime, la inferencia requiere aproximadamente 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior cubre el caso con holgura. Para despliegues de alto throughput, una A100 o H100 permitirían batchear muchas peticiones, aunque el modelo es pequeño para aprovecharlas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1660, RTX 2060, RTX 3050 en adelante).
- Opciones de despliegue: el modelo está diseñado para ejecutarse exclusivamente a través de decisio 0.51.0 o superior, mediante `python -m decisio.serve.vllm_engine` con `--calculator-reader cascade` y `--calculator-tagger`, o activándolo en `decision_config.json` con un hash de commit completo y los cuatro umbrales. No se documenta su uso con vLLM, llama.cpp, Ollama o TGI de forma independiente.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decisio-calculator-tagger | 153 M | No disponible | Token-classification de roles numéricos | Apache 2.0 | Hugging Face (tachara-ai) |
| answerdotai/ModernBERT-base | 149 M aprox. | No disponible en esta ficha | Encoder de propósito general | Apache 2.0 | Hugging Face |
| Modelos NER genéricos (p. ej. bert-base-NER) | 110 M aprox. | 512 tokens típicamente | Reconocimiento de entidades | Varía | Hugging Face |

La comparación directa con alternativas es limitada: no se conocen modelos públicos con la misma tarea específica (etiquetado de roles numéricos para aritmética exacta en decisio). Los modelos NER genéricos no cubren roles como tipo impositivo o comisión, y ModernBERT-base es el punto de partida sin fine-tuning para esta tarea. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- El modelo no funciona de forma autónoma: está diseñado para usarse exclusivamente a través de decisio 0.51.0 o superior, y su repositorio debe referenciarse con un hash de commit completo.
- Los umbrales de decisión están ajustados sobre etiquetas en float32; usar otra precisión puede alterar el comportamiento de las compuertas.
- No se documentan los idiomas soportados ni la composición del dataset de entrenamiento, por lo que se desconoce su cobertura lingüística y su robustez ante dominios no vistos.
- Riesgo de alucinación estructural: aunque las compuertas de precisión impiden mostrar bloques con valores no presentes en el texto, un etiquetado incorrecto de roles puede producir importes estructurados erróneos que superen las compuertas si la redacción concuerda con el caso.
- Licencia Apache 2.0 permite uso comercial, pero el autor remite a `NOTICE` para consultar los cambios realizados sobre el modelo base; es recomendable revisarlo antes de su redistribución.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa pública de su precisión en la tarea.
- El modelo no soporta generación, razonamiento, tool calling ni agentes; intentar usarlo fuera de decisio no es un caso de uso previsto.
- La fecha de creación del repositorio (2026-11-20) y la ausencia de descargas y likes indican que se trata de un modelo reciente y sin validación comunitaria pública.

## Enlaces

- Hugging Face: https://huggingface.co/tachara-ai/Decisio-calculator-tagger
- Repositorio decisio: https://github.com/aminry/decisio
- Documentación del lector en cascada de decisio: https://github.com/aminry/decisio/blob/main/docs/calculator.md#the-cascade-reader
- Modelo base ModernBERT-base: https://huggingface.co/answerdotai/ModernBERT-base
- Perfil del autor en Hugging Face: https://huggingface.co/tachara-ai
