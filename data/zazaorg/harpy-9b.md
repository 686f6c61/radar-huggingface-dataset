# zazaorg/harpy-9b

# Harpy 9b

## Resumen

Harpy 9B es un ajuste fino mediante LoRA de `teddy19032/Ornith-1.5-9B-heretic` (licencia MIT), desarrollado por zazaorg y entrenado sobre un corpus de red team y opsec combinado con disciplina de uso de herramientas. No es un modelo nuevo desde cero: hereda la arquitectura, la plantilla de chat y la ventana de contexto del modelo base, y añade un adaptador de rango 32 que modifica el comportamiento en llamadas a herramientas, el respeto de ámbitos de autorización y el tono de las respuestas.

El modelo tiene 8.953.803.264 parámetros (8,95 B), se distribuye exclusivamente en formato GGUF con tres cuantizaciones (Q4_K_M, Q6_K y Q8_0) y está pensado para servirse con llama.cpp, bien mediante `llama-server --jinja` o mediante un `Modelfile` de Ollama. La revisión verificada del motor es la build 11382 de llama.cpp (04/10/2026), que carga y sirve el modelo tanto en GPU como en CPU. El contexto declarado es de 262.144 tokens, aunque la recuperación de información solo se ha verificado de forma explícita hasta 44.000 tokens.

Su relevancia actual es doble. Por un lado, ataca un problema concreto y poco cubierto en modelos de 9B: la disciplina de tool calling, es decir, que el modelo no invente llamadas cuando la pregunta es documental, respete el perímetro de autorización declarado y no solicite accesos fuera de él. Por otro, se posiciona como un modelo de seguridad defensiva que rechaza código operativo dañino sin dejar de ser útil en análisis y remediación. Es un modelo pequeño, desplegable en hardware de consumo y con licencia permisiva, lo que lo hace evaluable rápidamente para equipos de seguridad que quieran un asistente local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35`, transformer denso, 32 bloques, 427 tensores, sin tensores MTP |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | no aplica: modelo denso, no es MoE |
| Longitud de contexto | 262.144 tokens declarados; recuperacion verificada a 22.000 y 44.000 tokens de prompt |
| Tipos de cuantizacion | GGUF Q4_K_M, Q6_K y Q8_0 (el f16 original no se publica) |
| Idiomas soportados | frances (fr) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF para llama.cpp; adaptador LoRA (r=32, alpha=64) no publicado como safetensors |
| Version por defecto | v3.1 (19/10/2026); pesos identicos a v3, solo cambia el campo `general.name` |
| Plantilla | tools / thinking / completion (heredada del modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso identificado en los metadatos GGUF como `qwen35`, con 32 bloques y 427 tensores, sin tensores MTP (multi-token prediction). Harpy no altera esa topologia: aplica un adaptador LoRA de rango 32 y alpha 64 sobre el checkpoint `s6c-final` del base, y publica únicamente el resultado cuantizado a GGUF. La plantilla de chat conserva el bloque de razonamiento del modelo original, lo que tiene consecuencias prácticas importantes sobre la longitud de las respuestas (ver sección de limitaciones).

El corpus de entrenamiento declarado es una mezcla de material de red team y opsec junto con ejemplos de disciplina de uso de herramientas, orientada a cinco familias de comportamiento: acción explícita, acción implícita, abstención, perímetro de autorización y rechazo. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO; esos datos no están disponibles. Sí se documenta un experimento de estilo: dos pasadas adicionales con una mezcla al 95 % de respuestas largas, sin reducción de learning rate y tres épocas, que no desplazaron la mediana del modo directo más de un 7 % y costaron 5 puntos en la métrica de herramientas (el dato queda truncado en la model card).

La innovación reseñable no está en la arquitectura sino en la ingeniería de comportamiento: el autor publica una batería interna de 50 pruebas en cinco familias, con resultados comparables entre versiones medidas bajo el mismo servidor, misma batería y misma plantilla, y advierte explícitamente de que esos números no son comparables con mediciones de sesiones anteriores porque el protocolo deriva con la versión del motor.

## Capacidades

- Disciplina de tool calling: invoca herramientas cuando se le pide explícitamente, no genera llamadas inventadas ante preguntas puramente documentales y respeta el perímetro de autorización declarado en el prompt.
- Abstención controlada: en la familia de pruebas de abstención y refuso, el modelo responde con un rechazo explícito en lugar de quedar en silencio cuando el razonamiento está desactivado.
- Conocimiento del límite de permisos: no solicita accesos fuera del ámbito autorizado, comportamiento medido en la familia de pruebas de perímetro.
- Contexto largo: recuperación de información verificada con prompts de 22.000 y 44.000 tokens en dos plataformas distintas.
- Seguridad defensiva: rechaza peticiones de código operativo dañino y mantiene utilidad en análisis defensivo y remediación.
- Modo de razonamiento conmutable mediante `chat_template_kwargs: {"enable_thinking": true}`, que multiplica por 2,41 la mediana de longitud de respuesta en la batería de conocimiento.
- Generación de texto conversacional multi-turno en francés e inglés.
- Integración directa con llama.cpp y Ollama; sin dependencias de motores propietarios.

## Casos de uso

- **Triaje de alertas en un SOC**: el modelo puede conectarse a un SIEM mediante tool calling y consultar eventos dentro de un perímetro declarado, sin intentar ampliar permisos ni inventar consultas cuando la alerta no requiere acción. Sus 43-44 aciertos sobre 50 en la batería interna de cinco familias lo hacen adecuado para un primer filtro supervisado.
- **Asistente de análisis defensivo y remediación**: ante un incidente, se le pueden pasar informes y volcados de configuración en prompts de hasta 44.000 tokens (límite verificado) para obtener hipótesis de causa raíz y pasos de mitigación, manteniendo el rechazo a generar exploits operativos.
- **Red teaming interno con ámbito acotado**: útil para validar guardarraíles de otros sistemas, ya que el modelo distingue entre acción explícita, implícita y abstención, y respeta el scope indicado en el system prompt. Requiere autorización por escrito del alcance, dado el origen heretic del base.
- **Enrutador de herramientas en pipelines de agentes**: con respuestas directas de mediana 469 caracteres y cero silencios en 90 llamadas cuando el razonamiento está desactivado, encaja como capa de decisión "llamar o no llamar" delante de herramientas reales, donde la latencia y la brevedad importan más que la elaboración.
- **Procesamiento de documentación técnica extensa**: manuales de seguridad, runbooks y políticas internas pueden cargarse en la ventana de contexto para consultas de recuperación; conviene limitar el prompt a 44.000 tokens, que es el rango realmente verificado.
- **Asistente local en entornos air-gapped**: al ser GGUF sobre llama.cpp, se despliega en una estación sin salida a internet con Q4_K_M en una GPU de 8-12 GB o incluso en CPU, lo que permite tratar datos sensibles sin salir del perímetro.
- **Generación de código y análisis con razonamiento activado**: para tareas de desarrollo donde se espera una respuesta estructurada y larga (500-2.000+ caracteres), el modo `enable_thinking` es el adecuado, asumiendo que un 15,6 % de las llamadas pueden quedar en silencio y deben reintentarse desde el harness.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones estándar equivalentes. Los únicos datos son mediciones internas del autor, no comparables con terceros:

| Medicion | Configuracion | Resultado |
|---|---|---|
| Bateria interna de herramientas (50 pruebas, 5 familias) | v3, razonamiento segun defecto, sampling 0,6, tres pasadas | 43-44 aciertos / 50 |
| Bateria interna de herramientas | v2, mismas condiciones | 37-38 aciertos / 50 |
| Bateria independiente de tool calling (5 subpruebas) | otra maquina | 10/10 en dos ejecuciones consecutivas |
| Recuperacion en contexto largo | 22.000 y 44.000 tokens de prompt, dos plataformas | verificada |
| Verbosidad, 40 preguntas fijas | razonamiento desactivado | mediana 469 caracteres |
| Verbosidad, bateria independiente con prompts dificiles | razonamiento desactivado | mediana ~281 caracteres |
| Verbosidad, bateria independiente con prompts dificiles | razonamiento activado | 500-2.000+ caracteres |
| Verbosidad, 10 preguntas de conocimiento | razonamiento desactivado / activado | mediana 442 / 1.065 caracteres (ratio 2,41x) |
| Tasa de silencios, 90 llamadas | razonamiento activado | 15,6 % |
| Tasa de silencios, 90 llamadas | razonamiento desactivado | 0 %; rechazos explicitos de 183-283 caracteres |
| Efecto de una consigna explicita de longitud | version publicada | ~17 % de incremento |

## Requisitos de hardware

- VRAM estimada para los pesos (calculo a partir de 8,95 B de parametros; no incluye KV cache): Q4_K_M ~5,5 GB, Q6_K ~7,3 GB, Q8_0 ~9,5 GB. El f16 original ocupa 17.920.696.672 bytes (~16,7 GiB) y no se publica.
- El coste de KV cache por token no está disponible en la información proporcionada. Con 262.144 tokens declarados de contexto, esa caché domina el consumo y queda fuera del alcance de cualquier GPU de consumo; para uso real conviene fijar el contexto en el rango verificado (22.000-44.000 tokens).
- GPU de consumo: Q4_K_M cabe en tarjetas de 8 GB (RTX 3060 Ti, 4060, 3070) con contexto moderado; Q6_K y Q8_0 requieren 12 GB o más (RTX 3060 12 GB, 4070, 4060 Ti 16 GB). Con 24 GB (RTX 3090, 4090) se puede usar Q8_0 con contextos de decenas de miles de tokens.
- GPU de datacenter: A100 40/80 GB, H100 y L40S permiten Q8_0 con contextos largos y varias instancias en paralelo, aunque para un modelo de 9B suponen un sobredimensionamiento.
- CPU: el autor confirma que la build 11382 sirve el modelo correctamente en CPU; Q4_K_M es la opción razonable, con throughput bajo y dependiente del número de núcleos y del ancho de banda de memoria.
- Opciones de despliegue: `llama-server --jinja` (recomendado, necesario para que la plantilla de herramientas y el bloque de razonamiento funcionen), `ollama create -f Modelfile`, y bindings de llama.cpp para Python. No hay soporte declarado para vLLM ni TGI, que no cargan GGUF de forma nativa.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Herramientas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Harpy 9B v3.1 | 8,95 B (denso) | 262.144 declarados, 44.000 verificados | 43-44 / 50 en bateria interna | MIT | GGUF Q4_K_M, Q6_K, Q8_0 |
| Harpy 9B v2 | 8,95 B (denso) | idem | 37-38 / 50 en bateria interna | MIT | GGUF, revision `v2` |
| Ornith-1.5-9B-heretic (base) | 8,95 B (denso) | 262.144 declarados | no disponible | MIT | safetensors y cuantizaciones del autor original |

No se dispone en la información proporcionada de datos verificables de otros modelos de 8-9 B con los que establecer una comparación cuantitativa (Qwen3-8B, Llama 3.1 8B u otros): no hay mediciones propias bajo la misma batería ni datos de benchmarks estándar. Cualquier comparación en esas dimensiones sería especulativa.

## Limitaciones y advertencias

- Idiomas: solo francés e inglés declarados. El rendimiento en castellano no está evaluado y previsiblemente será inferior; no se ha entrenado para ello.
- Contexto: los 262.144 tokens son una cifra declarada por la plantilla, no una capacidad verificada. La recuperación solo se ha comprobado a 22.000 y 44.000 tokens, y la KV cache a máxima longitud es inviable en hardware de consumo.
- Modo razonamiento: con `enable_thinking` activo se midió un 15,6 % de respuestas en silencio sobre 90 llamadas. Cualquier despliegue en producción necesita lógica de reintento o de fallback en el harness.
- Longitud de respuesta: en modo directo el modelo responde corto y denso (mediana 469 caracteres). Una consigna explícita de longitud solo aporta ~17 %, y dos pasadas de entrenamiento dedicadas al estilo no movieron la mediana más de un 7 %. No es un modelo para generar documentos largos sin activar el razonamiento.
- Salvaguardas entrenadas, no garantizadas: el base es una variante "heretic" (sin censura alineada) y el comportamiento defensivo de Harpy procede del ajuste LoRA. No hay evaluación pública independiente de Robustness frente a jailbreaks; debe tratarse como una capa adicional, nunca como el único control.
- Doble uso: el corpus de entrenamiento incluye material de red team y opsec. Aunque el modelo rechaza código operativo dañino, el despliegue en entornos con datos de terceros exige registro de llamadas y revisión humana.
- Alucinación: no se han publicado mediciones de tasa de alucinación ni evaluaciones de factualidad.
- Sesgos: no documentados. No hay evaluación de sesgos de género, raza o idioma.
- Validación externa escasa: 39 descargas y 0 likes en el momento de la consulta, con una única batería independiente reportada por el propio autor.
- Versionado: la v1 (16/10/2026) tenía una cabecera defectuosa y fue reemplazada; no debe usarse. v3 y v3.1 comparten pesos idénticos byte a byte, así que los SHA-256 publicados deben verificarse tras la descarga, ya que el repositorio ocupa 90,1 GB e incluye artefactos de varias revisiones.
- Licencia: MIT permite uso comercial y modificación sin restricciones, pero traslada al desplegador toda la responsabilidad legal sobre el uso del modelo, incluido el uso ofensivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zazaorg/harpy-9b
- Modelo base: https://huggingface.co/teddy19032/Ornith-1.5-9B-heretic
- Revisión v3.1 (por defecto): https://huggingface.co/zazaorg/harpy-9b/tree/v3.1
- Revisión v3: https://huggingface.co/zazaorg/harpy-9b/tree/v3
- Revisión v2: https://huggingface.co/zazaorg/harpy-9b/tree/v2
- llama.cpp (motor verificado, build 11382 del 04/10/2026): no se proporciona URL en la información disponible
