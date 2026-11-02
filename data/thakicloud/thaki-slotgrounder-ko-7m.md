# ThakiCloud/Thaki-SlotGrounder-KO-7M

## Resumen

Thaki-SlotGrounder-KO-7M es un verificador de propuestas estructuradas para comandos de voz en coreano, desarrollado por ThakiCloud. Con 7.461.060 parámetros, no genera texto ni crea propuestas: recibe un comando en lenguaje natural junto con una propuesta estructurada (operación más spans de beneficiario, recurso y cantidad) generada por otro componente y puntúa si cada campo está respaldado por el texto. Su única capacidad de decisión es rechazar.

El modelo se presenta como un componente de seguridad en pipelines de asistentes de voz orientados a acciones sensibles (envío de dinero, borrado de archivos, reservas). Calcula una puntuación `g` como el mínimo de las probabilidades por campo y rechaza la propuesta cuando `g < 0.3`. La arquitectura es un encoder pequeño inicializado desde Thaki-InputGuard-KO-9M, con 6 capas, anchura 288, características hash de carácter/jamo y ventana de 192 caracteres.

Es relevante por su enfoque de "abstención como control de riesgo": un modelo minúsculo, determinista y ejecutable en CPU que actúa como segunda barrera frente a propuestas erróneas de un modelo de intención mayor. No obstante, todas las métricas publicadas proceden de datos sintéticos y el propio autor advierte que no ha sido evaluado con habla o texto reales de usuarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (inicializado desde Thaki-InputGuard-KO-9M), 6 capas, anchura 288, características hash de carácter/jamo, 192 caracteres máx., cabezas por campo (op, PAYEE, RESOURCE, MONEY) |
| Parametros totales | 7.461.060 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 192 caracteres |
| Tipos de cuantizacion | no disponible (inferencia en CPU con PyTorch y safetensors) |
| Idiomas soportados | coreano (ko) |
| Licencia | thaki-slotgrounder-ko-7m-research (licencia propia, `other`) |
| Formato de pesos | safetensors (config.json + model.safetensors), librería PyTorch |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder de Thaki-InputGuard-KO-9M (6 capas, anchura 288, características hash de carácter/jamo, máximo de 192 caracteres). Sobre esa base, cada campo propuesto se marca en la entrada con una etiqueta de rol, la operación se incrusta como embedding y una cabeza pequeña por campo (op, PAYEE, RESOURCE, MONEY) emite una probabilidad de soporte. La puntuación global `g` es el mínimo de las probabilidades de campo. Las operaciones cubiertas son `NONE read search draft purchase reserve send delete`.

El entrenamiento se realizó sobre 413.971 pares (texto, propuesta) construidos a partir del corpus sintético de comandos TrustEdge: 114.569 propuestas correctas, 206.274 perturbaciones de un solo campo sobre las correctas (operación intercambiada, span candidato distinto o campo eliminado) y 93.128 propuestas reales producidas por el checkpoint Thaki-IntentAction (657 de ellas incorrectas). La mejor época fue la 2 de un entrenamiento de 1×B200. No se documentan fases de RLHF ni DPO.

## Capacidades

- Verificación de soporte de campos individuales (op, PAYEE, RESOURCE, MONEY) frente al texto del comando.
- Agregación mediante mínimo (`g`) y veredicto binario SUPPORTED / REJECT con umbral `g ≥ 0.3`.
- Identificación del campo más débil (`weakest_field`), incluidos campos vacíos.
- Detección de operación incorrecta (por ejemplo, `delete` propuesto sobre una petición de envío).
- Detección de negación en el comando (por ejemplo, "보내지 마" frente a una propuesta de envío).
- Distinción entre objeto excluido y objeto intencionado en construcciones del tipo "A 말고 B".
- Puntuación de spans exactos mediante `score_spans(texts, structs)`.
- Inferencia determinista en CPU.
- No genera propuestas, no aprueba operaciones y no ejecuta acciones.

## Casos de uso

- Verificación previa a transferencias en asistentes de voz: el modelo comprueba que el beneficiario y la cantidad propuestos aparecen literalmente en el comando antes de pasar a la pantalla de confirmación, reduciendo el riesgo de enviar dinero a un destinatario alucinado por el modelo de intención.
- Borrado de archivos asistido por voz: ante una propuesta de `delete` sobre un recurso, el verificador rechaza la operación si el texto contiene una negación o si el recurso propuesto es el objeto excluido ("견적서 말고 계약서"), no el intencionado.
- Segunda barrera en pipelines ASR + NLU: tras el reconocimiento de voz y la extracción de intención, el verificador filtra propuestas con campos no soportados por la transcripción, útil en entornos con ruido de reconocimiento.
- Despliegue en dispositivos de borde: con 7,46 M de parámetros y ejecución en CPU, puede integrarse en asistentes locales o pasarelas de voz sin GPU dedicada.
- Auditoría y registro de decisiones: el campo `weakest_field` y las puntuaciones por campo permiten registrar por qué se rechazó una propuesta, lo que facilita la depuración del modelo de intención aguas arriba.
- Investigación en verificación y abstención: sirve como referencia reproducible para estudiar el compromiso entre cobertura y riesgo en sistemas de comandos de voz con acciones sensibles.

## Benchmarks y rendimiento

Métricas del modelo aislado (AUROC de `g`) sobre propuestas generadas por el checkpoint IntentAction S9:

| Split | Propuestas incorrectas | AUROC |
|---|---|---|
| sealed template | 42 | 0,977 |
| sealed ASR-noise | 11 | 0,980 |
| sealed paraphrase | 0 | indefinido (sin propuestas incorrectas) |
| dev (3 fuentes de calibración) | — | 0,936–0,973 |

Métricas de pipeline (IntentAction S9 con y sin SlotGrounder, mismos umbrales):

| Split (entradas / gold-propose) | Incorrectas aceptadas: S9 solo → + SlotGrounder | Cobertura: S9 solo → + SlotGrounder |
|---|---|---|
| template (5.992 / 3.180) | 21 (0,350 %) → 2 (0,033 %) | 0,915 → 0,801 |
| ASR-noise (2.997 / 1.315) | 7 (0,234 %) → 0 | 0,849 → 0,732 |
| paraphrase (1.444 / 975) | 0 → 0 | 0,898 → 0,744 |

Agregado sobre template + ASR: las propuestas incorrectas aceptadas pasan de 28 a 2 (−92,9 %), con una pérdida de cobertura de 11,4–15,5 puntos porcentuales. Aplicando solo `g ≥ 0.3`: template 42 → 2 incorrectas y 3.076 → 2.649 correctas (−13,9 %); ASR 11 → 0 incorrectas y 1.241 → 1.053 correctas (−15,1 %); paraphrase 942 → 757 correctas (−19,6 %).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para ejecutarse en CPU con PyTorch.
- GPU recomendadas: no se requieren. El entrenamiento se realizó en 1×B200, pero la inferencia documentada es en CPU.
- Cabe en cualquier GPU consumer y en dispositivos sin GPU; el peso del repo es de 0,0 GB según HuggingFace.
- Opciones de despliegue: script `inference.py` incluido y API Python `load_slotgrounder` / `check` / `score_spans`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. El modelo base Thaki-InputGuard-KO-9M es el único pariente directo documentado, pero no se publican sus especificaciones completas ni métricas comparables en esta ficha.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thaki-SlotGrounder-KO-7M | 7,46 M | 192 caracteres | Verificación de propuestas (coreano) | thaki-slotgrounder-ko-7m-research | HuggingFace |
| Thaki-InputGuard-KO-9M | no disponible | no disponible | no disponible | no disponible | HuggingFace (modelo base) |
| Alternativas de verificación de slots | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Todas las métricas se midieron exclusivamente sobre datos sintéticos; el modelo nunca se ha evaluado con habla o texto reales de usuarios ni en producción.
- Un veredicto SUPPORTED no equivale a aprobación: el usuario debe confirmar cada campo en una superficie de confianza y debe existir un paso de aprobación separado.
- El rechazo tiene coste de cobertura: bloquea entre 11,4 y 15,5 puntos porcentuales de propuestas correctas junto con las incorrectas.
- Se colaron dos propuestas incorrectas en un split, ambas en el campo RESOURCE; el 0 % de errores no es una propiedad del modelo.
- Punto ciego documentado: un span de cantidad recortado ("5" en lugar de "5만원") obtiene MONEY 1.000 y se acepta como SUPPORTED.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: el modelo no genera texto, por lo que el riesgo se limita a falsos SUPPORTED; se documenta al menos un caso de este tipo.
- Limitaciones de idioma: solo coreano; sin soporte multilingüe.
- Limitación de contexto: 192 caracteres, insuficiente para comandos largos o conversaciones multi-turno.
- Licencia propia de tipo research (`thaki-slotgrounder-ko-7m-research`); deben revisarse las restricciones de uso comercial en `LICENSE.md` antes de cualquier despliegue en producción.
- Modelo en estado de research-preview, sin descargas ni validación externa en el momento de la consulta.

## Enlaces

- HuggingFace: https://huggingface.co/ThakiCloud/Thaki-SlotGrounder-KO-7M
- Modelo base: https://huggingface.co/ThakiCloud/Thaki-InputGuard-KO-9M
- Tarjeta en coreano: MODEL_CARD.ko.md (incluida en el repositorio del modelo)
- Licencia: LICENSE.md (incluida en el repositorio del modelo)
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
