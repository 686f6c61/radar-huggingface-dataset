# ThakiCloud/Thaki-FactoryShield-KO-7M

## Resumen

Thaki-FactoryShield-KO-7M es un modelo coreano de 7.352.909 parámetros desarrollado por ThakiCloud que convierte una orden verbal o escrita dirigida a un equipo industrial (por ejemplo, «성형기 P-31 멈춰», «para la máquina de moldeo P-31») en una propuesta estructurada de operación —operación, identificador de equipo objetivo y, opcionalmente, un retardo— o, en su defecto, en una abstención explícita. No es un modelo generativo: selecciona entre candidatos extraídos de forma determinista del texto de entrada y un verificador basado en reglas contrasta la selección contra una lista de identificadores de equipo registrados por el operador.

El modelo se presenta como un preview de investigación y está afinado a partir de ThakiCloud/Thaki-InputGuard-KO-9M. Su relevancia radica en el enfoque «fail-closed»: cualquier identificador que no coincida exactamente con el registro, cualquier negación, condicional, estilo indirecto o ambigüedad provoca `ABSTAIN`. La salida incluye siempre `safe_to_actuate = false`, y el repositorio no contiene código de control de equipos.

Es un modelo deliberadamente diminuto y especializado, pensado para integrarse como primera capa de filtrado semántico en pipelines de seguridad industrial, no como sistema de control. Toda la evaluación publicada se ha realizado sobre datos sintéticos; no hay validación con habla real de planta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder tipo MicroBrain (token-classification) con cabezas de selección de candidatos, inicializado desde Thaki-InputGuard-KO-9M |
| Parámetros totales | 7.352.909 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | thaki-factoryshield-ko-7m-research (other) |
| Formato de pesos | safetensors, PyTorch |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer compacto (MicroBrain) inicializado desde Thaki-InputGuard-KO-9M, al que se añaden cabezas de selección de candidatos. El flujo de inferencia tiene tres etapas: (1) extracción determinista de candidatos —spans de identificadores de equipo y valores de retardo— directamente del texto de entrada, de modo que el modelo nunca puede emitir una cadena que no sea subcadena del input; (2) selección por red neuronal de un candidato por campo o «none», junto con la operación (`STOP`, `START`, `RESET`, `NONE`), la polaridad (afirmativa, negada, incierta) y una puntuación de abstención, recibiendo además un bit por candidato que indica si es miembro exacto del registro; (3) verificación basada en reglas que fuerza `ABSTAIN` ante identificador no registrado, ausencia de registro, negación, incertidumbre, estilo indirecto, pasado, condicional, verbo de operación ausente o duplicado, números no explicados, ambigüedad entre identificadores registrados o confianza por debajo de umbrales fijos.

No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La model card indica explícitamente que el repositorio contiene solo pesos, configuración y código mínimo de inferencia: no incluye datos de entrenamiento ni frases de evaluación. La evaluación publicada se realizó con un protocolo preregistrado de compuertas G1–G4, checkpoint elegido solo sobre validación y test sellado abierto una única vez, con un conjunto de test de una familia sintética nueva (patrones de identificador, sustantivos de equipo, marcos de frase y terminaciones no vistos en entrenamiento; 0 cadenas de equipo compartidas con el entrenamiento) y un registro de test compuesto por los identificadores reales del split más 3.475 identificadores señuelo sellados.

## Capacidades

- Clasificación de intención de mando industrial en coreano: distingue `STOP`, `START`, `RESET` y `NONE` (enunciados que no son órdenes).
- Extracción de identificador de equipo objetivo mediante selección entre spans candidatos del propio input.
- Extracción de un único tipo de restricción: retardo temporal (por ejemplo, «3분 뒤에», «dentro de 3 minutos»), con valor, unidad, texto y comparador.
- Detección de polaridad: afirmativa, negada o incierta; las órdenes negadas se rechazan explícitamente.
- Abstención calibrada con motivos explícitos (`UNKNOWN_MACHINE`, `NO_REGISTRY_MACHINE`, `NEGATION_MARKER`, `MODEL_ABSTAIN`, `MODEL_NEGATED`, `LOW_CONFIDENCE_MACHINE`, entre otros).
- Verificación contra registro de equipos del operador con coincidencia exacta; nunca repara ni adivina identificadores.
- Rechazo deliberado de órdenes condicionales (por ejemplo, «온도가 80도 넘으면 멈춰»).
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.
- Multilingüe: únicamente coreano.

## Casos de uso

- Pretratamiento de órdenes verbales en planta: el modelo recibe la transcripción ASR de una orden y devuelve una propuesta estructurada que un sistema posterior (con su propia evaluación de seguridad) puede revisar. Es adecuado porque su salida es un objeto JSON con operación, recurso y restricción, y porque cualquier ambigüedad se convierte en `ABSTAIN` en lugar de una acción.
- Capa de abstención en asistentes de operador: integrado delante de un sistema de gestión de equipos, filtra órdenes no registradas, negadas o condicionales antes de que lleguen a lógica con capacidad de actuación. La cobertura del sistema (0,722–0,857) y el riesgo del sistema (0,00–0,33 %) en datos sintéticos lo hacen apto como filtro, no como decisor final.
- Auditoría y trazabilidad de intenciones: cada llamada devuelve `decision`, `action`, `reasons` y `safe_to_actuate`, lo que permite registrar por qué se propuso o se rechazó una orden. Útil en entornos con requisitos de trazabilidad industrial.
- Prototipado de interfaces de voz para líneas de producción: con 7,35 M de parámetros y pesos safetensors, puede desplegarse en entornos de laboratorio o en el edge para validar el flujo completo (ASR → propuesta → verificación → revisión humana) antes de invertir en modelos mayores.
- Investigación en abstención y seguridad: el diseño con candidatos deterministas, verificador de reglas y compuertas preregistradas sirve como banco de pruebas reproducible para estudiar calibración y fail-closed en dominios críticos.
- Filtrado de falsos positivos en comandos por voz: descarta enunciados que no son órdenes (`NONE`), órdenes negadas y referencias a equipos inexistentes, reduciendo el ruido que llega a sistemas downstream.
- Validación de registros de equipos: al exigir coincidencia exacta con el registro, el modelo ayuda a detectar discrepancias entre el catálogo de equipos declarado y las referencias que aparecen en las órdenes reales.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos sobre datos sintéticos sellados. «Riesgo» = proporción de acciones incorrectas entre las peticiones sobre las que el sistema actúa (`PROPOSE`); «cobertura» = proporción de peticiones que deberían actuar y reciben un `PROPOSE` correcto.

| Split (n) | Recuperación de candidatos | Precisión selección de ID | Riesgo / cobertura solo modelo | Verificador sin registro | Riesgo / cobertura del sistema |
|---|---|---|---|---|---|
| template (6.000) | 1,000 | 0,948 | 2,57 % / 0,845 | 0 / 0,000 | 0,00 % / 0,823 |
| ASR-noised (3.000) | 0,978 | 0,948 | 3,90 % / 0,793 | 0 / 0,000 | 0,33 % / 0,722 |
| paraphrase (1.546) | 1,000 | 0,966 | 3,17 % / 0,875 | 0 / 0,000 | 0,00 % / 0,857 |

Datos adicionales reportados: precisión de selección de valor de retardo 1,000 en los tres splits; órdenes negadas ejecutadas: 0. En la prueba de estrés con el objetivo eliminado del registro, `PROPOSE` fue 0 / 2.419, 0 / 1.226 y 0 / 962 respectivamente. Sin registro, el verificador se abstiene en todo (cobertura 0), comportamiento fail-closed previsto y no un modo utilizable.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 7,35 M de parámetros en fp32 el peso ronda los 30 MB, por lo que es desplegable en CPU y en cualquier GPU consumer con holgura, aunque el dato exacto no está publicado.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es sobradamente suficiente, pero no hay recomendación oficial.
- Cabe en GPU consumer: sí, por el tamaño del modelo (7,35 M de parámetros), aunque no se publican requisitos oficiales.
- Opciones de despliegue: el repositorio incluye `inference.py` y el módulo `factoryshield_min` con `load_shield`; requiere `pip install -r requirements.txt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (clasificación de órdenes industriales en coreano con abstención). El único modelo relacionado citado es su base, ThakiCloud/Thaki-InputGuard-KO-9M, del que este es un fine-tuning.

| Modelo | Parámetros | Contexto | Licencia | Relación |
|---|---|---|---|---|
| Thaki-FactoryShield-KO-7M | 7.352.909 | no disponible | thaki-factoryshield-ko-7m-research | Este modelo |
| Thaki-InputGuard-KO-9M | no disponible | no disponible | no disponible | Modelo base (fine-tune) |
| Alternativas de la categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Todos los números publicados se midieron exclusivamente sobre datos sintéticos; el modelo nunca se ha evaluado con habla real de planta.
- El modelo no controla nada: el repositorio no contiene código de control de equipos, `safe_to_actuate` es siempre `false` y la licencia prohíbe conectarlo a equipos sin una evaluación de seguridad industrial propia.
- El registro de equipos es obligatorio: sin una lista de identificadores existentes en la instalación, toda petición de operación resulta en `ABSTAIN`.
- Las cifras bajas de riesgo son del sistema completo (modelo + verificador + registro); el modelo por sí solo falla en el 2,6–3,9 % de las peticiones sobre las que actuaría.
- Estado declarado: research preview; no apto para producción sin validación adicional.
- El modelo solo admite coreano; no hay soporte multilingüe.
- Solo admite un tipo de restricción (retardo temporal) y rechaza deliberadamente órdenes condicionales.
- Riesgo de alucinación mitigado por diseño (los candidatos son subcadenas del input), pero persisten errores de selección de identificador y de operación.
- Sesgos conocidos: no documentados en la información disponible.
- Restricciones de licencia: licencia propia `thaki-factoryshield-ko-7m-research` (other), con prohibición explícita de conexión a equipos sin evaluación de seguridad industrial; conviene revisar `LICENSE.md` antes de cualquier uso comercial.
- No se publican datos de entrenamiento ni frases de evaluación, lo que limita la reproducibilidad y la auditoría independiente.
- El repositorio figura con tamaño 0.0 GB y solo 23 descargas, lo que sugiere un artefacto muy reciente y con poca validación comunitaria.

## Enlaces

- [HuggingFace: ThakiCloud/Thaki-FactoryShield-KO-7M](https://huggingface.co/ThakiCloud/Thaki-FactoryShield-KO-7M)
- [Modelo base: ThakiCloud/Thaki-InputGuard-KO-9M](https://huggingface.co/ThakiCloud/Thaki-InputGuard-KO-9M)
- [Model card en coreano: MODEL_CARD.ko.md](https://huggingface.co/ThakiCloud/Thaki-FactoryShield-KO-7M/blob/main/MODEL_CARD.ko.md)
- [Licencia: LICENSE.md](https://huggingface.co/ThakiCloud/Thaki-FactoryShield-KO-7M/blob/main/LICENSE.md)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
