# ZODOGAVAJD/fundednext-payout-calculator-propfirmw

## Resumen

El artefacto publicado en Hugging Face bajo el identificador `ZODOGAVAJD/fundednext-payout-calculator-propfirmw` no es un modelo de lenguaje ni un modelo de aprendizaje automatico en el sentido habitual del termino. Se trata de un repositorio etiquetado como "finance", "trading" y "payout-calculator" cuya model card describe una supuesta calculadora de pagos (payouts) y reparto de beneficios para cuentas de trading de la firma de prop trading FundedNext, asociada a un codigo promocional ("PROPFIRMW").

La publicacion no incluye pesos, arquitectura, tokenizador ni pipeline declarado. La informacion disponible se limita a metadatos del repositorio y a un README de caracter marcadamente promocional, con enlaces de afiliado y afirmaciones comerciales sobre descuentos y reembolsos. No hay evidencia de que exista un modelo entrenado, un dataset ni codigo funcional asociado.

Por tanto, esta ficha documenta lo que el repositorio declara y senala explicitamente la ausencia de los elementos tecnicos que permitirian evaluarlo como modelo. Cualquier uso en produccion requeriria verificar de forma independiente el contenido real del repositorio, que no se ha podido confirmar a partir de la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (no se declaran safetensors, GGUF ni otros) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre arquitectura. El repositorio no declara transformer, MoE, SSM ni ninguna otra familia de modelos, y no incluye pipeline de Hugging Face asignado. La model card describe funcionalidades de calculo financiero (expectativa neta del trader, calendario de pagos quincenales y velocidad de crecimiento del capital) sin especificar si se implementan mediante codigo determinista, reglas o un modelo estadistico.

Tampoco hay datos sobre entrenamiento: no se indica numero de tokens, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas. Las unicas cifras presentes en el README son comerciales (reparto de beneficios del 80 % con escalado a 90 % y 95 %, un 15 % de recompensa en fase de desafio, un 30 % de descuento y un 120 % de reembolso de comisiones), no parametros de modelo.

## Capacidades

- Calculo declarado de expectativa neta del trader para cuentas de prop trading.
- Calculo declarado de calendarios de pago quincenales.
- Estimacion declarada de velocidad de crecimiento del capital.
- No se declara generacion de texto, razonamiento general, codigo, matematicas ni vision.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingues; el campo de idiomas figura como no disponible.
- No se declara modo de razonamiento (thinking mode), audio ni ninguna otra modalidad.

## Casos de uso

- Evaluacion de rentabilidad de una cuenta de prop trading: el artefacto se presenta como calculadora de expectativa neta, de modo que un trader podria estimar el beneficio esperado tras aplicar el reparto de beneficios declarado. La idoneidad depende de verificar que el codigo exista y sea correcto, algo no confirmado.
- Planificacion de flujo de caja: el calendario de pagos quincenales permitiria, en teoria, proyectar ingresos periodicos. No hay evidencia de implementacion funcional.
- Comparacion de planes de reparto: las cifras de 80 %, 90 % y 95 % permitirian modelar escenarios de escalado, siempre que la logica de calculo este documentada y sea auditable.
- Simulacion de crecimiento de capital: la "capital growth velocity" declarada podria usarse para proyectar la evolucion de una cuenta, sujeto a validacion independiente de la formula.
- Analisis de coste promocional: el README describe descuentos y reembolsos asociados a un codigo, lo que permitiria calcular el coste efectivo de una suscripcion. Se trata de informacion comercial, no de una capacidad del modelo.
- Integracion en herramientas de seguimiento de trading: en caso de existir codigo reutilizable, podria incorporarse a paneles internos. No se ha confirmado que el repositorio contenga dicho codigo.
- Advertencia: ninguno de estos casos debe asumirse operativo sin inspeccionar el repositorio, dado que no se declaran pesos, pipeline ni artefactos ejecutables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no se declaran pesos ni arquitectura.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se declara ningun formato de pesos compatible con estos motores.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se identifican modelos comparables en la informacion proporcionada, ya que el artefacto no se presenta como modelo de aprendizaje automatico sino como una supuesta calculadora financiera con fines promocionales.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `ZODOGAVAJD/fundednext-payout-calculator-propfirmw` | no disponible | no disponible | MIT | Repositorio en Hugging Face, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se declaran pesos, arquitectura ni pipeline: no es verificable como modelo de aprendizaje automatico.
- La model card tiene caracter promocional, con enlaces de afiliado y codigos de descuento, lo que resta fiabilidad a las afirmaciones tecnicas.
- Cero descargas y cero "likes" en el momento de la consulta: sin validacion por parte de la comunidad.
- Riesgo de alucinacion o de resultados incorrectos no evaluable, al no existir especificacion funcional ni codigo documentado.
- Sesgos conocidos: no disponible; no se ha publicado informacion al respecto.
- Limitaciones de contexto o idioma: no disponible.
- Licencia MIT: permite uso comercial y modificacion, pero el usuario asume todo el riesgo sobre el contenido y su exactitud.
- Los datos financieros y promocionales citados (descuentos, reembolsos, repartos) no han sido verificados y no deben tomarse como asesoramiento financiero.
- No apto para produccion sin auditoria previa del repositorio y de cualquier codigo que contenga.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ZODOGAVAJD/fundednext-payout-calculator-propfirmw
- Portal de FundedNext citado en la model card: https://fundednext.com/?fpr=PROPFIRMW
- Sitio de comparativas citado en la model card: https://propfirm-match.pro/
- Paper, blog tecnico o demo adicionales: no disponible
