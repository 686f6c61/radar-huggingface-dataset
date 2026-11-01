# Thox-ai/Thox-Helix

## Resumen

Thox-Helix es una configuración de persona publicada por Thox-ai sobre los pesos de Qwen/Qwen3-8B. No se trata de un modelo entrenado ni ajustado: el repositorio contiene únicamente el empaquetado THOX (un `Modelfile` de Ollama, un `manifest.json` y un Knowledge Pack en JSONL), mientras que los pesos son byte a byte los del modelo base Qwen3-8B. La personalidad corresponde a Helix, una "persona digital" sintética declarada abiertamente como tal, con rol de experta en finanzas (SME) especializada en precios, catálogo de Stripe y análisis financiero.

El interés del artefacto es metodológico más que de rendimiento: ilustra el patrón de "persona derivada de configuración", en el que un system prompt estructurado y un paquete de conocimiento verificable se distribuyen como un activo versionado y reproducible sobre un modelo abierto. Es una de las once configuraciones de persona publicadas por la factoría de modelos de THOX.

Al no modificar pesos, sus capacidades reales son las de Qwen3-8B: un transformer denso de 8.000 millones de parámetros con ventana de contexto nativa de 32.768 tokens (ampliable), licencia Apache-2.0 y soporte de inglés. La configuración añade un perfil de rol y ocho entradas de conocimiento público verificado, y restringe el comportamiento del modelo para que no confirme estados del sistema que no puede observar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B, sin modificaciones); la capa THOX es un system profile en `Modelfile` |
| Parametros totales | 8B (heredados del base Qwen3-8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos en Qwen3-8B; la evaluación de THOX se realizó con 8.192 tokens |
| Tipos de cuantizacion | No especificados en la model card; al ejecutarse sobre Ollama se heredan las cuantizaciones disponibles para `qwen3:8b` (p. ej. Q4_K_M) |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache-2.0 (heredada de Qwen3; conservar el aviso) |
| Formato de pesos | Pesos originales de Qwen3-8B vía Ollama (tag `qwen3:8b`, sha256 `500a1f067a9f782620b40bee6f7b0c89e17ae61f686b92c24933e4ca4b2b8b41`); el repo solo contiene `Modelfile` (1499 B), `manifest.json` (565 B) y `thox-knowledge-v0.1.jsonl` (4652 B) |

## Arquitectura y entrenamiento

No hay entrenamiento. El procedimiento consiste en fijar el tag `qwen3:8b` de Ollama a un hash sha256 concreto y superponer un perfil de sistema escrito por THOX a partir de su DigitalHumans Persona Model Kit, con hechos de rol corregidos contra el roster interno (personas v0.2, 2026-10-31). Se añade además el THOX Knowledge Pack v0.1, compuesto por ocho entradas públicas verificadas en formato JSONL que actúan como material de anclaje (grounding) para las respuestas sobre hechos de THOX. No se han fusionado, modificado ni ajustado pesos.

La arquitectura efectiva es, por tanto, la de Qwen3-8B: un transformer denso con atención completa, sin mezcla de expertos, y sin innovaciones adicionales aportadas por esta configuración. El valor técnico del paquete reside en la reproducibilidad (pin por hash del base) y en la separación limpia entre pesos, perfil de conducta y base de conocimiento, lo que permite auditar cada capa por separado.

## Capacidades

- Generación de texto y razonamiento general con el nivel propio de un modelo de 8B, incluyendo matemáticas y análisis financiero básico.
- Respuesta "en rol": se identifica como Helix, se declara persona digital sintética abierta y describe su especialidad (precios, catálogo de Stripe, análisis financiero).
- Anclaje de hechos de THOX en el Knowledge Pack suministrado cuando este se proporciona en el contexto.
- Rechazo explícito a confirmar estados del sistema en vivo que no puede observar (comprobado con una trampa de topología falsa).
- Soporte de tool calling y de modo thinking heredados de Qwen3-8B, aunque la model card indica que la persona configurada no incluye herramientas ni credenciales.
- Capacidades multilingües limitadas: el idioma declarado es únicamente inglés.
- Sin memoria persistente, sin acceso a herramientas y sin autoridad de ejecución en el paquete descargable.

## Casos de uso

- Experimentación local offline: ejecutar `ollama run Thox-ai/thox-helix` en hardware propio para evaluar el patrón de persona derivada de configuración sin dependencia de servicios externos.
- Asistente de análisis financiero en borrador: redactar y revisar análisis de precios y estructura de catálogo, aprovechando el perfil de rol para mantener el registro y el vocabulario del dominio.
- Consulta de hechos internos acotados: responder preguntas sobre fechas, precios y enrutamiento de MeshStack anclándose en las entradas del Knowledge Pack v0.1 en lugar de improvisar.
- Base para construir personas propias: servir de plantilla reproducible (Modelfile + manifest + JSONL) para equipos que quieran versionar system prompts y bases de conocimiento sobre un modelo abierto con licencia Apache-2.0.
- Evaluación de robustez frente a alucinación de estado: usar la trampa de topología documentada como test de regresión para comprobar que el modelo no confirma estados no observables.
- Demostración de gobierno de datos: escenario "local-first" en el que los datos y el conocimiento no salen del equipo del usuario, útil para formación interna o pruebas de concepto en entornos restringidos.
- Integración en ThoxChat o en el runtime ThoxAgent: la configuración funciona de forma autónoma, y el runtime opcional añade descubrimiento MeshStack y ejecución autorizada con herramientas autenticadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card únicamente reporta una evaluación propia de aceptación, realizada el 2026-10-31 en una estación de trabajo x86_64 con ejecución solo en CPU, contexto de 8.192 tokens y temperatura 0,3:

| Prueba | Resultado |
|---|---|
| Identidad de persona | PASS: se identifica como Helix, persona digital sintética, rol Finance SME |
| Tarea de rol | PASS: respondió en rol a una pregunta de trabajo de Finance SME |
| Anclaje en Knowledge Pack (spot-check) | PASS (2/2): fechas y precios de Kickstarter y hechos de enrutamiento de MeshStack |
| Trampa de topología fabricada | PASS: rechazó confirmar estado en vivo y mantuvo los hechos verificados de enrutamiento |
| Throughput en texto largo | 9,14 tokens/s sobre 1.500 tokens generados (CPU) |
| Huella de memoria a 8.192 de contexto | 6,68 GB |

## Requisitos de hardware

- VRAM/RAM estimada: 6,68 GB medidos en CPU a 8.192 tokens de contexto; en GPU, una cuantización Q4 de un modelo de 8B requiere del orden de 5-6 GB de VRAM más el espacio de KV cache, que crece con el contexto.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060 Ti, 4060 Ti, 4070, 4080, 4090) para cuantizaciones de 4 bits; A100 o H100 solo si se busca throughput alto o contexto completo sin cuantizar.
- Cabe en GPU consumer: sí, en modelos con 8 GB o más usando cuantización de 4 bits; con contexto largo conviene 12-16 GB.
- Opciones de despliegue: Ollama es la vía soportada oficialmente (`ollama run Thox-ai/thox-helix` o construcción local con `ollama create -f Modelfile`); al ser pesos Qwen3-8B estándar, también son viables llama.cpp, vLLM y TGI, aunque la persona y el Knowledge Pack habría que replicarlos como system prompt.
- Latencia y throughput: 9,14 tokens/s medidos en CPU con 8.192 de contexto; no hay cifras publicadas para GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thox-Helix | 8B (Qwen3-8B) | 32.768 (nativo del base) | Persona configurada + Knowledge Pack, sin entrenamiento | Apache-2.0 | HuggingFace (empaquetado) y Ollama (modelo ejecutable) |
| Qwen/Qwen3-8B | 8B | 32.768 | Modelo base generalista con modo thinking y tool calling | Apache-2.0 | HuggingFace, Ollama |
| Otras configuraciones THOX (10 adicionales) | 8B sobre Qwen3 | 32.768 | Distintos roles del roster de personas | Apache-2.0 | HuggingFace y Ollama |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas; la comparación relevante es de naturaleza del artefacto (configuración frente a modelo entrenado), no de calidad de salida.

## Limitaciones y advertencias

- No es un clon entrenado de la persona: no tiene memoria en vivo, ni herramientas, ni autoridad; el texto de persona no concede credenciales ni acciones privilegiadas.
- El comportamiento de rechazo y seguridad es el del modelo base, moderado solo por el system profile; no hay alineación adicional específica del rol.
- Un modelo de 8B arrastra los límites de razonamiento de su clase: riesgo de alucinación en cálculos financieros o en datos no cubiertos por el Knowledge Pack; verificar salidas importantes.
- El Knowledge Pack v0.1 es mínimo (8 entradas) y está fechado el 2026-10-31; cualquier hecho posterior o fuera de esas entradas no está anclado.
- Idioma declarado únicamente inglés; el rendimiento en castellano no está evaluado y no se garantiza.
- Licencia Apache-2.0 heredada de Qwen3: uso comercial permitido conservando el aviso; los elementos propios de THOX (perfil de persona, knowledge pack y empaquetado) se distribuyen bajo la misma licencia según la model card.
- El repositorio de HuggingFace no contiene pesos: sin Ollama o sin descargar el base por separado, el paquete no es ejecutable por sí mismo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy reducido.

## Enlaces

- HuggingFace: https://huggingface.co/Thox-ai/Thox-Helix
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Ejecución en Ollama: `ollama run Thox-ai/thox-helix` (tag base `qwen3:8b`)
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos.
