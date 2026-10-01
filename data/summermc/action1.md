# summerMC/action1

## Resumen

Action1 es un modelo experimental publicado por el usuario summerMC en Hugging Face. No es un modelo de lenguaje generativo al uso: se describe como un backbone ligero de lenguaje que actua como codificador de caracteristicas congelado para una politica de "computer use" (control de interfaz grafica). El repositorio contiene dos artefactos separados: el checkpoint base Action1, que produce representaciones ocultas, y la politica `computer_use_v4`, almacenada en la subcarpeta del mismo nombre, que convierte esas representaciones en acciones estructuradas sobre una GUI.

El interes del modelo esta en su enfoque: en lugar de generar texto libre, predice acciones discretas y parametros continuos (movimiento de cursor, clic con coordenadas, escritura, pulsaciones de teclado, scroll, arrastre y finalizacion de tarea). La politica se entrena en dos fases, ajuste supervisado (SFT) seguido de PPO con GAE, manteniendo el backbone congelado. La version V4 introduce mejoras especificas en localizacion de clic, precision de scroll y enrutado de herramientas fuera de distribucion.

El modelo tiene un tamano de repositorio de 0,2 GB y dimensiones internas muy reducidas (hidden size del backbone de 512, memoria temporal de 384, politica de 384 con 3 capas residuales), lo que lo orienta a control secuencial de baja latencia medido en 13,46 ms por accion sobre una NVIDIA L4. La licencia es Apache 2.0, lo que permite uso comercial, aunque se trata de un artefacto experimental con cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion agrupada (tag `loop_gqa_action`), implementacion de codigo personalizado en `modeling_loop_gqa_action.py`; backbone congelado mas politica de control residual con pooling por atencion y memoria GRU temporal |
| Parametros totales | no disponible (el repositorio ocupa 0,2 GB, pero no se publica el recuento de parametros) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF ni AWQ/GPTQ) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el uso previsto es control de GUI, no generacion multilingue) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors para la politica (`computer_use_v4/policy.safetensors`); el formato del checkpoint base no se detalla explicitamente, solo "model weights" |

Dimensiones internas declaradas:

| Componente | Valor |
|---|---|
| Hidden size del backbone | 512 |
| Tamano de memoria temporal | 384 |
| Hidden size de la politica | 384 |
| Profundidad de la politica residual | 3 |
| Cabezas de pooling por atencion | 4 |
| Espacio de acciones | move, click, drag, type, press, scroll, finish |

## Arquitectura y entrenamiento

El backbone Action1 se usa como codificador de caracteristicas congelado. El flujo declarado es: objetivo de texto mas estado estructurado entran al backbone, que emite una secuencia de estados ocultos; despues hay un pooling por atencion de 4 cabezas, una memoria GRU temporal de tamano 384 y una red de politica residual de 3 capas con cabezas separadas para seleccion de herramienta, prediccion de clic, de scroll, de teclado, de copia de texto y una funcion de valor. La etiqueta `loop_gqa_action` y el fichero `modeling_loop_gqa_action.py` apuntan a una variante de atencion de consultas agrupadas (GQA) con algun tipo de procesamiento en bucle, pero la model card no detalla el mecanismo interno ni el numero de capas.

El entrenamiento de la politica de computer use se hace en dos etapas: primero SFT y despues PPO con Generalized Advantage Estimation, manteniendo el backbone Action1 congelado durante toda la optimizacion. La etapa de PPO conserva un objetivo de behavior cloning supervisado para evitar que el aprendizaje por refuerzo destruya el enrutado de herramientas aprendido en el SFT. Entre los mecanismos de estabilidad declarados estan el recorte de PPO (clipping), la ancla de behavior cloning, monitorizacion de KL, recorte de gradiente, penalizaciones por herramienta incorrecta y por finalizacion prematura, seleccion del mejor checkpoint y un fallback seguro a SDPA cuando la ejecucion de atencion resulta inestable.

Las innovaciones tecnicas que el autor destaca para V4 son tres. Primera, la prediccion de clic estructurada: en lugar de regresar coordenadas globales directamente, se predice una region gruesa de pantalla mas un residuo de coordenada intra-region. Segunda, la prediccion de scroll residual: se combina un bin grueso de scroll con un residuo continuo y ademas se le pasa a la politica la distancia restante (`remaining_scroll = target_scroll - current_scroll`), lo que permite corregir en pasos posteriores. Tercera, la escritura se entrena con objetivos alfanumericos y simbolicos aleatorizados en lugar de un vocabulario fijo pequeno, con un campo dedicado de copia de texto en los prompts de entrenamiento. No se publican datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO adicionales mas alla de SFT y PPO.

## Capacidades

- Prediccion de acciones estructuradas para interaccion con GUI: `move`, `click`, `drag`, `type`, `press`, `scroll` y `finish`.
- Prediccion de clic con coordenadas continuas, por ejemplo `{"tool": "click", "x": 800.2, "y": 449.7}`.
- Pulsaciones de teclado especificas: ENTER, TAB, ESC, SPACE, BACKSPACE, DELETE, UP, DOWN, LEFT, RIGHT.
- Escritura de texto arbitrario mediante la accion `type` con campo de texto, por ejemplo `{"tool": "type", "text": "OpenAI"}`.
- Scroll con cantidad numerica continua, por ejemplo `{"tool": "scroll", "amount": 600.0}`.
- Seleccion de herramienta (tool routing) con una exactitud declarada del 100 % tanto en distribucion como fuera de distribucion.
- Estimacion de valor mediante una cabeza de funcion de valor, lo que habilita su uso como politica dentro de un bucle de RL.
- Memoria temporal a corto plazo mediante una GRU de 384 unidades, que le permite usar el estado de pasos anteriores.
- No se declaran capacidades de generacion de texto libre, razonamiento, codigo, matematicas, vision, audio ni soporte multilingue. El autor indica explicitamente que la politica esta disenada para control secuencial de baja latencia y no para generacion de texto sin restricciones.
- No se menciona soporte de function calling generico, agentes multi-paso fuera de la GUI ni modos de "thinking".

## Casos de uso

- Automatizacion de pruebas de interfaz grafica: la politica puede emitir acciones de clic, escritura y scroll sobre una GUI sintetica o real para recorrer flujos de usuario en CI/CD, con una latencia de 13,46 ms por accion que permite secuencias fluidas sin cuello de botella.
- Agentes de operacion de escritorio o navegador: al predecir `move`, `click`, `drag`, `type`, `press`, `scroll` y `finish`, puede integrarse como capa de bajo nivel en un agente que reciba un objetivo en texto y un estado estructurado y devuelva la siguiente accion.
- Rellenado de formularios y entrada de datos: la cabeza de copia de texto (`type`) permite extraer una cadena solicitada y teclearla, util para migraciones de datos entre aplicaciones sin API.
- Navegacion por menus y listas largas: la prediccion de scroll residual, que recibe la distancia restante, permite corregir el desplazamiento en pasos sucesivos, adecuado para localizar elementos en paginas largas.
- Investigacion en aprendizaje por refuerzo aplicado a control: al exponer una funcion de valor y un espacio de acciones bien definido, sirve como banco de pruebas para comparar algoritmos de RL o tecnicas de estabilidad (PPO clipping, GAE, anclas de behavior cloning).
- Aceleracion de la recoleccion de datos de interaccion: un agente de baja latencia puede generar trayectorias de GUI a gran escala (74,3 acciones por segundo en L4) para alimentar el entrenamiento de modelos de computer use mayores.
- Asistencia a usuarios con movilidad reducida: la prediccion estructurada de clic y teclado podria servir de base para un sistema de control alternativo, aunque los errores de clic medidos (MAE de 102,4 px en distribucion) limitan su viabilidad sin un modelo de vision que refine la localizacion.

## Benchmarks y rendimiento

Los unicos datos publicados provienen de un entorno de computer use sintetico definido por el propio autor, que evalua prediccion de acciones estructuradas y no autonomia real de navegador o escritorio. No hay resultados de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos en la informacion disponible.

En distribucion:

| Metrica | Resultado |
|---|---:|
| Exito global | 64,2 % |
| Exactitud de herramienta | 100,0 % |
| Puntuacion media | 0,920 |
| Coincidencia exacta en `type` | 42,0 % |
| Coincidencia exacta en `press` | 100,0 % |
| Exito de clic | 13,0 % |
| MAE de clic | 102,4 px |
| Error p90 de clic | 190,4 px |
| Exito de scroll | 100,0 % |
| MAE de scroll | 0,6 |

Fuera de distribucion:

| Metrica | Resultado |
|---|---:|
| Exito global | 27,5 % |
| Exactitud de herramienta | 100,0 % |
| Puntuacion media | 0,719 |
| Coincidencia exacta en `type` | 20,0 % |
| Coincidencia exacta en `press` | 56,0 % |
| Exito de clic | 8,0 % |
| MAE de clic | 131,8 px |
| Error p90 de clic | 224,0 px |
| Exito de scroll | 25,0 % |
| MAE de scroll | 162,9 |

Rendimiento de inferencia medido en una NVIDIA L4, incluyendo el forward del backbone Action1 y el de la politica de computer use:

| Metrica | Valor |
|---|---:|
| Latencia media | 13,46 ms/accion |
| Latencia mediana | 13,41 ms/accion |
| Latencia p95 | 13,86 ms/accion |
| Latencia p99 | 13,95 ms/accion |
| Throughput | 74,3 acciones/segundo |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia indirecta, el repositorio completo pesa 0,2 GB y el hidden size del backbone es 512, por lo que el modelo es muy pequeno y previsiblemente se ejecuta con menos de 1 GB de VRAM en fp16; esta cifra es una estimacion derivada del tamano del repositorio, no un dato publicado.
- GPU recomendadas: la unica medica documentada es NVIDIA L4, con 13,46 ms por accion. Por el tamano del artefacto, cualquier GPU con al menos unos pocos GB de VRAM deberia bastar.
- GPU de consumo: cabe con holgura en tarjetas de consumo (por ejemplo, RTX 3060, RTX 4090) segun el tamano del repositorio, aunque no hay mediciones publicadas en esas tarjetas.
- Opciones de despliegue: el autor solo documenta carga mediante `transformers` con `AutoModelForCausalLM`, `AutoTokenizer` y `trust_remote_code=True` (el fragmento de codigo de la model card aparece truncado). No se confirma soporte de vLLM, TGI, llama.cpp ni Ollama, y no se publican pesos GGUF, por lo que su uso en esas herramientas requeriria conversion propia y, en el caso de llama.cpp, reimplementar la arquitectura de codigo personalizado.
- Latencia y throughput: 13,46 ms de media, 13,41 ms de mediana, 13,86 ms en p95 y 13,95 ms en p99, con 74,3 acciones por segundo en NVIDIA L4.
- La politica (`computer_use_v4/policy.safetensors`) y el backbone se cargan por separado, asi que el pipeline de despliegue necesita orquestar ambos artefactos.

## Comparativa con modelos similares

No se han encontrado en la busqueda web datos de benchmarks, parametros ni especificaciones de modelos comparables de computer use que permitan una comparacion rigurosa. Los resultados de busqueda devueltos corresponden al perfil de Hugging Face del autor y a un proyecto no relacionado llamado Summer Engine, que no guarda vinculacion con este modelo.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Estado |
|---|---|---|---|---|---|
| summerMC/action1 | no disponible (repo de 0,2 GB) | no disponible | 64,2 % de exito global en benchmark sintetico propio (en distribucion) | apache-2.0 | publicado en Hugging Face |
| Alternativas de computer use de la misma categoria (UI-TARS, OS-Atlas, Aguvis, etc.) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de terceros en esta busqueda, por lo que cualquier cifra comparativa seria especulativa.

## Limitaciones y advertencias

- Los propios benchmarks del autor muestran un rendimiento muy bajo fuera de distribucion: 27,5 % de exito global frente al 64,2 % en distribucion. La generalizacion es, por tanto, debil.
- La localizacion de clic es el principal punto debil: 13,0 % de exito en distribucion y 8,0 % fuera, con un MAE de 102,4 px y 131,8 px respectivamente, y errores p90 de 190,4 px y 224,0 px. Esto lo inhabilita para tareas que exijan precision sobre elementos pequenos de la interfaz.
- La copia exacta de texto tambien es fragil: 42,0 % de coincidencia exacta en `type` en distribucion y 20,0 % fuera. La extraccion de cadenas arbitrarias no es fiable.
- El desplazamiento (scroll) se degrada fuertemente fuera de distribucion, con un MAE de 162,9 frente a 0,6 en distribucion y un exito del 25,0 % frente al 100,0 %.
- El entorno de evaluacion es sintetico y evalua prediccion de acciones, no autonomia real de navegador o escritorio, por lo que las cifras no deben extrapolarse a entornos de produccion reales.
- El modelo no esta pensado para generacion de texto libre; usarlo como modelo de lenguaje general producira resultados pobres.
- No se declaran idiomas soportados, sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad. Al ser un artefacto experimental sin descargas ni validacion externa, no hay garantias de robustez.
- La licencia apache-2.0 permite uso comercial, pero no exime de los riesgos tecnicos anteriores ni de posibles obligaciones derivadas del dataset de entrenamiento, que no se documenta.
- Requiere `trust_remote_code=True` y ejecuta codigo de modelado personalizado (`modeling_loop_gqa_action.py`), lo que implica revisar el codigo antes de desplegarlo en entornos sensibles.
- El modelo se creo y actualizo el 1 de octubre de 2026 segun los metadatos, con cero descargas y cero likes, lo que indica ausencia total de validacion por parte de la comunidad.
- No hay informacion sobre cuantizacion disponible, lo que complica su despliegue en hardware limitado sin trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/summerMC/action1
- Perfil y modelos del autor: https://huggingface.co/summerMC/models
- Datasets del autor: https://huggingface.co/summerMC/datasets
- Summer Engine (resultado de busqueda no relacionado con este modelo): https://www.summerengine.com/
- Documentacion de modelos de IA de Summer Engine (no relacionado): https://docs.summerengine.com/knowledge-base/ai-models
- Configuracion de MCP de Summer Engine (no relacionado): https://docs.summerengine.com/mcp/setup
- No se han encontrado papers, blogs tecnicos, repositorios adicionales ni demos asociados al modelo en la busqueda realizada.
