# Suvir-Misra/GST-Qwen-1.5B-Legal-GGUF

## Resumen

GST-Qwen-1.5B-Legal-GGUF es un ajuste fino del modelo Qwen2.5-1.5B-Instruct orientado al dominio juridico y fiscal indio, distribuido unicamente en formato GGUF para su ejecucion local mediante Ollama y llama.cpp. Lo desarrolla Suvir-Misra y cubre un espectro normativo amplio: la Income-tax Act de 1961, la CGST Act de 2017, el Code of Civil Procedure de 1908, la Indian Contract Act de 1872, la Transfer of Property Act de 1882, la Negotiable Instruments Act de 1881, la Constitution of India y los nuevos codigos penales de 2023 (BNS, BNSS y BSA).

El modelo parte de una base compacta de 1.543.714.304 parametros (aproximadamente 1,5 mil millones) con arquitectura transformer densa, licencia Apache-2.0 y un unico idioma declarado, el ingles. Su interes practico reside en la especializacion: en lugar de competir en capacidad general, se posiciona como un asistente de consulta estatutaria para desarrolladores que necesiten integrar recuperacion normativa india en aplicaciones de legaltech, sin depender de APIs externas ni de hardware de gama alta.

El repositorio ocupa 2,6 GB e incluye dos cuantizaciones GGUF (Q8_0 de ~1,57 GB y Q4_K_M de ~980 MB), lo que permite desplegarlo en equipos de consumo. Es un modelo de nicho, con cero descargas y cero likes en el momento de la ficha, por lo que debe tratarse como un artefacto experimental mas que como una solucion validada en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (~1,57 GB) y Q4_K_M (~980 MB) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (solo cuantizaciones; no se publican safetensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con atencion causal estandar, sin mezcla de expertos ni mecanismos hibridos. El ajuste fino se realizo con Apple MLX sobre corpus juridicos indios multi-estatuto, empleando enmascaramiento de prompt (`--mask-prompt`) para que la perdida se calcule unicamente sobre las respuestas del asistente.

La model card describe tres tecnicas de alineacion: Stochastic Weight Averaging (SWA) promediando snapshots de adaptadores a lo largo de la trayectoria de convergencia para evitar minimos agudos; Weight-Space Orthogonalization (WSO) con escalados calibrados de las proyecciones de atencion query-key ($s_{qk} = 1.002$) y value-output ($s_{vo} = 1.000$) para maximizar la discriminacion de tokens estatutarios; y unos parametros de muestreo fijados en temperatura 0.1, `repeat_penalty` 1.08 y `repeat_last_n` 64 para evitar bucles en la enumeracion de secciones. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles con formato chat de Qwen (`<|im_start|>` / `<|im_end|>`).
- Consulta normativa sobre fiscalidad india: residencia fiscal (secciones 6(1), 6(1A), 6(6)), cinco cabeceras de renta (seccion 14), deduccion estandar (seccion 16(ia)), plusvalias (secciones 2(42A), 112A, 111A) y regimen nuevo por defecto (seccion 115BAC).
- GST: condiciones de credito fiscal de input (seccion 16(2) CGST), mecanismo de reverse charge (seccion 9), adjudicacion 73 frente a 74 y reembolsos bajo la regla 5 de las CENVAT Credit Rules.
- Procedimiento civil: distincion decreto/orden (secciones 2(2) y 2(14) CPC), res judicata y res sub judice (secciones 10 y 11), rechazo de demanda (Order VII Rule 11) y medidas cautelares (Order XXXIX Rules 1 y 2).
- Derecho contractual y de propiedad: indemnizacion frente a garantia (secciones 124 y 126), danos liquidados (secciones 73 y 74), lis pendens (seccion 52 TPA) e impago de cheques (seccion 138 de la Negotiable Instruments Act).
- Derecho constitucional y penal: derechos fundamentales (articulos 14, 19, 21 y 32), doctrina de la estructura basica, derecho a la privacidad y provisiones de libertad provisional bajo BNSS (secciones 478-483).
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso agentico, vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Asistente de consulta estatutaria para legaltech: el modelo responde preguntas cerradas sobre numeros de seccion y requisitos legales concretos, lo que permite construir un chatbot de primera linea que derive los casos complejos a un profesional.
- Generacion de resumenes normativos para despachos: a partir de un supuesto fiscal, el modelo puede enumerar las secciones aplicables de la Income-tax Act y explicar el test de residencia o el regimen de deducciones con temperatura baja para minimizar variabilidad.
- Formacion interna de equipos de compliance: desplegado con Ollama en estaciones de trabajo, sirve como tutor offline para repasar conceptos de GST e ITC sin enviar consultas a servicios en la nube.
- Preprocesado y etiquetado de documentos juridicos: el modelo puede clasificar fragmentos de contratos o escritos procesales segun la materia (CPC, Contract Act, TPA) antes de pasarlos a un pipeline de recuperacion.
- Prototipado rapido en entornos con hardware limitado: con la cuantizacion Q4_K_M (~980 MB) cabe en portatiles sin GPU dedicada, lo que facilita demos y pruebas de concepto de asistentes legales.
- Soporte a la redaccion de borradores: generar explicaciones de conceptos como lis pendens, equity of redemption o las seis categorias de hipoteca de la seccion 58 TPA para documentos internos de formacion.
- Filtro de preguntas frecuentes en portales de servicios fiscales: al estar especializado en secciones concretas, puede responder FAQ sobre plazos de escrito de contestacion (Order VIII Rule 1 CPC) o plazos de notificacion en la seccion 138.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas del dominio juridico indio, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM/RAM estimada: Q8_0 requiere aproximadamente 1,6-2 GB de memoria; Q4_K_M aproximadamente 1-1,3 GB, incluyendo overhead de contexto.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090); tambien funciona en CPU pura dado su tamano reducido.
- Cabe holgadamente en GPU consumer; es uno de los puntos fuertes del modelo frente a alternativas de mayor tamano.
- Opciones de despliegue: Ollama (via Modelfile incluido), llama.cpp (`llama-cli`), y cualquier runtime compatible con GGUF. No se documenta soporte nativo para vLLM o TGI en formato GGUF.
- Latencia y throughput: no disponibles. Con 1,5B parametros y cuantizacion Q4_K_M se espera inferencia interactiva en GPU consumer, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Formato |
|---|---|---|---|---|---|
| GST-Qwen-1.5B-Legal-GGUF | 1,54B | no disponible | Legal/fiscal indio | Apache-2.0 | GGUF |
| Qwen2.5-1.5B-Instruct (base) | 1,54B | 32.768 tokens (segun Qwen) | General | Apache-2.0 | safetensors, GGUF |
| Modelos legales indios de mayor tamano | no disponible | no disponible | Legal indio | no disponible | no disponible |

La comparacion directa con otros ajustes legales indios no esta disponible en la informacion proporcionada. Frente a su modelo base, la diferencia principal es la especializacion en estatutos indios y la distribucion exclusiva en GGUF, a costa de perder capacidades generales y de un unico idioma.

## Limitaciones y advertencias

- El modelo se declara unicamente en ingles; no se garantiza calidad en hindi ni en otras lenguas oficiales de India.
- Es un ajuste fino de un modelo de 1,5B parametros: la capacidad de razonamiento juridico complejo, la sintesis de jurisprudencia y el manejo de casos con multiples normas concurrentes son limitados por el tamano.
- Riesgo elevado de alucinacion en numeros de seccion, importes y fechas de entrada en vigor; la model card no aporta evaluaciones que cuantifiquen la fidelidad factual.
- La model card incluye un descargo explicito: el modelo es para fines educativos, informativos y de investigacion, y no constituye asesoramiento juridico formal.
- No se documenta la longitud de contexto efectiva; el ajuste fino pudo reducirla respecto al modelo base.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso comunitario ni de validacion independiente.
- La licencia Apache-2.0 permite uso comercial, pero la responsabilidad sobre errores en materia legal recae en el integrador.
- No se publican pesos en safetensors, lo que limita el reentrenamiento y la inspeccion del ajuste.
- El sesgo del corpus de entrenamiento no esta documentado; puede reflejar una vision particular de la interpretacion estatutaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suvir-Misra/GST-Qwen-1.5B-Legal-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- Apple MLX: https://github.com/ml-explore/mlx
