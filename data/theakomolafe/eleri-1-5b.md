# theakomolafe/eleri-1.5b

## Resumen

Eleri-1.5B es un adaptador LoRA de 1.500 millones de parámetros, desarrollado por theakomolafe, que se especializa en una tarea muy concreta: verificar si un pago realizado por un agente de IA coincide con el mandato de autorización bajo el que se ejecutó. El modelo clasifica cada pago en uno de tres veredictos (coincide, no coincide, o requiere revisión) y, en caso de discrepancia, identifica exactamente cuál de los 15 modos de fallo específicos se ha producido (sobrecoste, proveedor incorrecto, mandato caducado, dirección de wallet similar, etc.).

Está construido como un adaptador LoRA sobre Qwen/Qwen2.5-1.5B-Instruct, entrenado mediante QLoRA contra la cuantización 4-bit de unsloth para eficiencia de entrenamiento, y evaluado en precisión completa. El diseño prioriza el coste y la latencia: el objetivo declarado es poder auditar cada pago individual que realiza un agente, no solo muestras ocasionales. El modelo se acompaña de EleriBench, un benchmark público con un conjunto de test bloqueado de 1.500 ejemplos, y se utiliza en producción en el producto Sawa para auditoría de gasto de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base: Qwen2.5-1.5B-Instruct) + adaptador LoRA |
| Parametros totales | 1.500 millones (modelo base) + adaptador LoRA (tamano no especificado, repo de 0,1 GB) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la documentacion) |
| Tipos de cuantizacion | Adaptador LoRA compatible con el base en bfloat16 o cuantizacion 4-bit (entrenado con QLoRA 4-bit) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

Eleri-1.5B es un adaptador LoRA de rango 16 (según el ejemplo de vLLM) sobre el modelo base Qwen2.5-1.5B-Instruct, un transformer decoder denso de 1.500 millones de parámetros. El adaptador se entrenó con QLoRA, utilizando la versión 4-bit de unsloth del modelo base para reducir el coste de entrenamiento, y se evalúa en precisión completa (bfloat16). El entrenamiento se realizó con 30.000 ejemplos sintéticos generados con un enfoque "label-first": primero se define la etiqueta exacta (veredicto y anomalía) y después se genera el registro de transacción correspondiente, lo que garantiza que cada ground truth sea exacto y no inferido. Los datos cubren 16 categorías de gasto, 15 tipos de anomalía y 3 veredictos, con formatos de pago que imitan protocolos reales (x402, AP2, ACP y Stripe). No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado (SFT) mediante TRL.

## Capacidades

- Verificación de pagos de agentes: dado un pago y un mandato de autorización, determina si coinciden y emite un veredicto estructurado (coincide, no coincide, requiere revisión).
- Detección de anomalías: identifica exactamente cuál de los 15 modos de fallo predefinidos se ha producido (sobrecoste, proveedor incorrecto, mandato caducado, dirección de wallet similar, etc.).
- Salida estructurada JSON: entrenado para producir veredictos con un esquema JSON concreto, compatible con decodificación restringida (constrained decoding) en vLLM.
- Calibración de confianza: presenta un error de calibración esperado (ECE) de 0,05 en 10 bins, lo que indica que las probabilidades predichas están bien alineadas con los resultados reales.
- Especialización en finanzas: entrenado específicamente para registros de pago de agentes, no para tareas generales de chat o razonamiento.
- No soporta tool calling ni funciones de agente generales; su función es puramente de auditoría posterior al hecho.

## Casos de uso

- Auditoría de pagos de agentes de IA en producción: el modelo puede integrarse en un pipeline de pagos para revisar cada transacción que un agente autónomo realiza, comparándola con el mandato de autorización correspondiente. Su bajo coste (0,04-0,08 USD por 1.000 auditorías en configuración de producción) permite auditar el 100% de los pagos, no solo una muestra.
- Control de gasto en plataformas de agentes: una plataforma que aloja múltiples agentes puede usar Eleri-1.5B para detectar sobrecostes, pagos a proveedores no autorizados o mandatos caducados, generando alertas automáticas para revisión humana.
- Cumplimiento normativo en finanzas descentralizadas: dado que soporta formatos como x402 y AP2, puede verificar que los pagos en protocolos de pago descentralizados cumplan con las autorizaciones establecidas, reduciendo el riesgo de fraude o error.
- Detección de direcciones de wallet similares (lookalike): el modelo identifica pagos enviados a direcciones que se asemejan a la del proveedor legítimo, un vector de ataque común en entornos de agentes autónomos.
- Revisión de facturas y mandatos en empresas: una empresa que delega compras a agentes puede usar el modelo para verificar que cada compra se ajusta a las políticas de gasto predefinidas, clasificando las discrepancias en categorías accionables.
- Evaluación comparativa de modelos de verificación de pagos: Eleri-1.5B sirve como modelo de referencia en EleriBench, permitiendo a otros equipos medir el rendimiento de sus propios sistemas de verificación de gasto de agentes contra un estándar público.

## Benchmarks y rendimiento

Resultados declarados por el autor en EleriBench (conjunto de test bloqueado de 1.500 ejemplos), comparados con dos modelos frontier en configuración few-shot con el mismo prompt y esquema de salida:

| Modelo | Verdict accuracy | Anomaly macro-F1 | ECE (10-bin) | Coste por 1.000 auditorias |
|---|---|---|---|---|
| **eleri-1.5b** | **0,972** | **0,989** | **0,050** | 0,04-0,62 USD * |
| claude-haiku-4-5 (few-shot) | 0,808 | 0,684 | 0,128 | 5,26 USD |
| gpt-4o-mini (few-shot) | 0,682 | 0,392 | 0,240 | 0,60 USD |

\* El rango inferior (0,04-0,08 USD) corresponde a mediciones en producción con vLLM y decodificación restringida; el valor de 0,62 USD es una estimación naive del harness de evaluación durante el entrenamiento.

No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K; el modelo está diseñado exclusivamente para la tarea de verificación de pagos.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre un modelo de 1.500 millones de parámetros, la inferencia es viable en GPUs de consumo. Con el base en bfloat16, se necesitan aproximadamente 4-5 GB de VRAM; con cuantización 4-bit, alrededor de 2-3 GB.
- GPUs recomendadas: cualquier GPU con al menos 6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, etc.) puede ejecutar el modelo con comodidad. Para despliegue en producción con vLLM, una GPU de datacenter como A10 o A100 es suficiente para manejar lotes.
- Opciones de despliegue: vLLM (recomendado, con soporte nativo de LoRA y decodificación restringida), Transformers + PEFT, y potencialmente llama.cpp si se convierte el adaptador a GGUF (no documentado oficialmente).
- Latencia y throughput: no se proporcionan cifras exactas, pero el coste medido de 0,04-0,08 USD por 1.000 auditorías en producción sugiere un throughput alto con procesamiento por lotes. En una GPU consumer, la latencia por petición individual debería ser de decenas de milisegundos, dado el tamaño del modelo.

## Comparativa con modelos similares

No existen muchos modelos públicos especializados en verificación de pagos de agentes. La comparación más relevante es contra los baselines del propio benchmark y contra el modelo base sin adaptar:

| Modelo | Parametros | Contexto | Verdict accuracy (EleriBench) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **eleri-1.5b** | 1.5B + LoRA | No especificado | 0,972 | Apache 2.0 | HuggingFace |
| Qwen2.5-1.5B-Instruct (base, sin fine-tuning) | 1.5B | 32K (del base) | No evaluado en EleriBench | Apache 2.0 | HuggingFace |
| claude-haiku-4-5 (few-shot) | No publico | No publico | 0,808 | Propietaria | API |
| gpt-4o-mini (few-shot) | No publico | No publico | 0,682 | Propietaria | API |

La ventaja de Eleri-1.5B frente a los modelos propietarios es su coste significativamente menor (hasta 100 veces más barato que claude-haiku-4-5) y su licencia abierta, que permite despliegue local y modificación. Frente al base sin adaptar, el fine-tuning aporta una mejora sustancial en precisión y calibración para la tarea específica.

## Limitaciones y advertencias

- No es un modelo de chat general: está entrenado exclusivamente para la tarea de verificación de pagos. Usarlo para otros fines producirá resultados pobres o inesperados.
- Dependencia del prompt y esquema de salida: los resultados publicados solo se obtienen con el prompt de sistema exacto y el esquema JSON de EleriBench. Cambiar el prompt o el esquema degradará el rendimiento.
- Datos de entrenamiento sintéticos: los 30.000 ejemplos son generados artificialmente, no provienen de transacciones reales. El rendimiento ante distribución real de pagos no está probado más allá del conjunto de test de EleriBench.
- No debe tomar decisiones autónomas sobre dinero: el modelo está diseñado para informar un proceso de revisión, no para aprobar, bloquear o mover fondos por sí mismo. El autor enfatiza que en producción (Sawa) el modelo audita después del hecho y solo señala anomalías.
- Alcance limitado: no es un modelo de detección de fraude genérico; requiere un mandato de autorización explícito contra el que comparar el pago.
- Idioma: solo inglés. No hay soporte para otros idiomas.
- Riesgo de alucinación: aunque la calibración es buena (ECE 0,05), el modelo puede emitir veredictos incorrectos en casos extremos o con datos fuera de distribución. La precisión del 97,2% implica un 2,8% de errores en el conjunto de test.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/theakomolafe/eleri-1.5b
- Repositorio de EleriBench (benchmark y harness de evaluación): https://github.com/Olamide1/eleribench
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Cuantización 4-bit de unsloth usada en entrenamiento: https://huggingface.co/unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit
