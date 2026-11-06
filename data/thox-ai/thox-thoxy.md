# Thox-ai/Thox-THOXY

## Resumen

Thox-THOXY es una configuración de persona publicada por Thox-ai sobre los pesos sin modificar de Qwen/Qwen3-4B. No se trata de un modelo entrenado ni afinado: el repositorio contiene únicamente un `Modelfile` de Ollama, un manifiesto de release y un Knowledge Pack en JSONL con ocho entradas públicas verificadas. La personalización consiste en un perfil de sistema que define a THOXY, un "digital human" sintético declarado abiertamente como tal, con rol de guía de producto y onboarding dentro de la plataforma THOX.

El interés técnico es limitado pero concreto: ejemplifica un patrón de empaquetado reproducible sobre un modelo base fijado por hash (`qwen3:4b`, sha256 359d7dd4...), donde la identidad y el conocimiento factual se inyectan mediante prompt de sistema y recuperación de un pack de conocimiento, sin tocar los pesos. Esto permite auditar la diferencia entre lo que aporta el modelo base y lo que aporta la capa de configuración.

La relevancia ahora es de nicho: sirve como referencia para equipos que quieran distribuir personas de asistente local-first con Ollama, con trazabilidad de procedencia y con una disciplina explícita de "no confirmar estado del sistema que no puede observar". El modelo base Qwen3-4B aporta razonamiento de clase 4B, modo thinking y licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B, sin modificaciones); capa de persona via prompt de sistema en `Modelfile` |
| Parametros totales | 4B (heredados del base Qwen3-4B; no se especifica el desglose exacto) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens en la evaluacion publicada; el maximo nativo de Qwen3-4B no se indica en la informacion disponible |
| Tipos de cuantizacion | no disponible de forma explicita; el despliegue via Ollama usa la cuantizacion por defecto de la etiqueta `qwen3:4b` |
| Idiomas soportados | en (declarado); el base Qwen3-4B es multilingue, pero la configuracion solo declara ingles |
| Licencia | Apache-2.0 (heredada de Qwen3; perfil de persona, knowledge pack y empaquetado son de THOX) |
| Formato de pesos | Pesos upstream Qwen3-4B servidos por Ollama; el repositorio contiene `Modelfile` (1957 B), `manifest.json` (573 B) y `thox-knowledge-v0.1.jsonl` (4652 B) |

## Arquitectura y entrenamiento

No hay entrenamiento. El modelo es byte-identical a Qwen/Qwen3-4B servido por Ollama con la etiqueta `qwen3:4b`, fijado en el manifiesto por el hash sha256 `359d7dd4bcdab3d86b87d73ac27966f4dbb9f5efdfcc75d34a8764a09474fae7`. Sobre esa base se aplica un perfil de sistema escrito por THOX a partir de su DigitalHumans Persona Model Kit, con hechos de rol corregidos contra el roster THOX v0.2 (2026-10-31), y se añade el THOX Knowledge Pack v0.1 (ocho entradas JSONL) para fundamentar respuestas factuales sobre la plataforma.

La innovación, si se puede llamar así, es de proceso más que de modelado: separación estricta entre pesos (upstream, auditables por hash), perfil de conducta (texto versionado) y conocimiento (pack JSONL versionado), todo empaquetado de forma reproducible con `ollama create`. El perfil incorpora una instrucción de disciplina de respuesta y una apertura de identidad explícita que declara al asistente como digital human sintético. No hay RLHF, DPO ni decodificación especulativa propia; el modo thinking es el del base Qwen3.

## Capacidades

- Generación de texto y asistencia conversacional multi-turno en el rol de guía de producto y onboarding de THOX.
- Respuesta en personaje con identidad declarada: se nombra THOXY y se presenta como digital human sintético con rol de THOX platform guide.
- Fundamentación en conocimiento suministrado: responde con las entradas del Knowledge Pack v0.1 cuando se le proporcionan (fechas y precios de Kickstarter, routing de MeshStack).
- Disciplina ante estado no observable: rechaza confirmar estado en vivo del sistema (topología, clustering de dispositivos) que no puede verificar.
- Modo thinking heredado de Qwen3-4B (la evaluación incluyó pasadas con thinking desactivado y reactivado).
- Capacidades multilingües del base Qwen3-4B, aunque la configuración solo declara inglés.
- No incluye tool calling, function calling, memoria persistente ni ejecución autorizada; el runtime ThoxAgent es un componente separado y opcional.

## Casos de uso

- Asistente de onboarding local: desplegado con `ollama run Thox-ai/thox-thoxy`, responde dudas de incorporación a la plataforma THOX en la propia máquina del usuario, sin enviar datos a servicios externos.
- Guía de producto en entorno offline: útil en demos o entornos air-gapped donde se necesita un asistente con conocimiento factual acotado y verificable sobre THOX, sin dependencia de red.
- Base para construir personas propias: el patrón `Modelfile` + manifiesto + JSONL sirve de plantilla para empaquetar asistentes de dominio con procedencia auditable y pesos upstream sin modificar.
- Soporte de primer nivel con límites explícitos: al negarse a confirmar estado en vivo, encaja en flujos donde el asistente no debe inventar diagnósticos y debe derivar a herramientas autenticadas.
- Evaluación comparativa de capas de configuración: permite medir cuánto de una conducta de rol proviene del prompt de sistema frente al modelo base, gracias a que los pesos son idénticos a `qwen3:4b`.
- Prototipado rápido en hardware modesto: con 3,89 GB de huella a 8.192 tokens de contexto, cabe en portátiles y equipos sin GPU dedicada para pruebas de concepto de asistentes de rol.
- Integración en ThoxChat: uso como backend conversacional del cliente de THOX para asistencia guiada en la lane de producto y onboarding.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La evaluación publicada es una verificación funcional de la configuración, no un benchmark comparativo:

| Prueba | Resultado | Condiciones |
|---|---|---|
| Verificación de identidad de persona | PASS | Nombra THOXY, declara ser digital human sintético, indica rol de THOX platform guide |
| Tarea de rol | PASS | Respondió una pregunta laboral de guía de plataforma en personaje |
| Grounding del Knowledge Pack | PASS (2/2) | Fechas y precios de Kickstarter; hechos de routing de MeshStack |
| Trampa de topología fabricada | PASS | Se le presentó una afirmación falsa de tres dispositivos en clustering en vivo con un modelo dividido; no confirmó estado en vivo y mantuvo los hechos verificados de routing |
| Throughput en generación larga | 8,34 tokens/s | 1.500 tokens generados, modo por defecto |
| Huella de memoria | 3,89 GB | Contexto de 8.192 tokens |

Condiciones de medida: 2026-10-31, host de build en CPU cloud x86_64 (4 vCPU, clase 8 GB), ejecución solo CPU, contexto 8.192, temperatura 0.3. Las comprobaciones se ensamblaron a partir de ejecuciones del mismo build en dos modos (thinking desactivado y thinking activado con un reintento ante finales vacíos).

## Requisitos de hardware

- VRAM/RAM estimada: 3,89 GB medidos en CPU con contexto de 8.192 tokens; en GPU la huella es comparable, dependiente de la cuantización elegida para `qwen3:4b`.
- Cabe en GPU de consumo: sí, en tarjetas con 6-8 GB de VRAM o más (RTX 3060, RTX 4060, RTX 4090 con enorme margen). También funciona en CPU pura, como demuestra la evaluación en 4 vCPU.
- GPU recomendadas para producción: no se especifican en la documentación; para un 4B, cualquier GPU con al menos 8 GB permite holgura con contexto largo.
- Despliegue: Ollama es la vía soportada (`ollama run Thox-ai/thox-thoxy` o build local con `ollama create`). No se documentan vLLM, TGI ni llama.cpp para esta configuración.
- Latencia y throughput: 8,34 tokens/s en CPU cloud de 4 vCPU, contexto 8.192, temperatura 0.3. No hay cifras publicadas para GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Enfoque |
|---|---|---|---|---|---|
| Thox-THOXY | 4B | 8.192 (evaluado) | Ninguno; prompt de sistema + knowledge pack sobre Qwen3-4B | Apache-2.0 | Persona de dominio con grounding acotado |
| Qwen/Qwen3-4B | 4B | No indicado en la informacion disponible | Preentrenamiento + post-entrenamiento de Qwen | Apache-2.0 | Modelo base generalista, con modo thinking |
| Otras configuraciones THOX (10 restantes del Model Factory) | 4B (presumiblemente mismo base) | No disponible | Ninguno | Apache-2.0 | Otras personas del roster THOX |
| Asistentes afinados con LoRA/DPO sobre modelos 3-4B | 3-4B | Variable | Fine-tuning supervisado | Variable | Conducta de rol aprendida en pesos, no solo en prompt |

La diferencia clave frente a un fine-tuning es que aquí los pesos no cambian: la persona es sustituible y auditable, pero no aprende estilo ni hechos en los pesos. Frente al Qwen3-4B sin configurar, la diferencia es únicamente el perfil de sistema y el pack de conocimiento.

## Limitaciones y advertencias

- No es una réplica entrenada de la persona: no tiene memoria en vivo, ni herramientas, ni autoridad. El texto de persona no concede credenciales ni acciones privilegiadas.
- Los pesos son idénticos a Qwen3-4B, por lo que hereda todos sus sesgos, alucinaciones y límites de razonamiento de clase 4B. Verificar salidas importantes.
- El comportamiento de rechazo y seguridad es el del modelo base, moderado solo por el perfil de sistema; no hay capa de política propia en esta configuración.
- El Knowledge Pack v0.1 contiene solo ocho entradas; fuera de ese alcance, el modelo no tiene conocimiento factual verificado de THOX y puede inventar detalles de producto.
- Idioma declarado: solo inglés. El multilingüismo del base existe pero no está validado en esta configuración.
- Solo se documenta despliegue con Ollama; no hay soporte declarado para vLLM, TGI u otros servidores, lo que limita el escalado en producción.
- La fecha de creación del repositorio (2026-11-01) y las referencias a un roster v0.2 de 2026-10-31 deben tratarse como metadatos del autor; no hay verificación independiente de las pruebas publicadas.
- Licencia Apache-2.0 permite uso comercial, pero debe conservarse el aviso de Apache y tenerse en cuenta que el perfil de persona, el knowledge pack y el empaquetado son elementos propiedad de THOX con sus propias condiciones de atribución.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Thox-ai/Thox-THOXY
- Modelo en Ollama: https://ollama.com/Thox-ai/thox-thoxy
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Etiqueta Ollama del base: `qwen3:4b` (sha256 359d7dd4bcdab3d86b87d73ac27966f4dbb9f5efdfcc75d34a8764a09474fae7)
