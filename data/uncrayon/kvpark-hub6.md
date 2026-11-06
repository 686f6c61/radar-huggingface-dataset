# uncrayon/kvpark-hub6

## Resumen

kvpark-hub6 es un paquete de adaptadores lineales de cache KV publicado por el usuario uncrayon en Hugging Face. No es un modelo de lenguaje en sentido estricto: es un conjunto de pesos que permite transferir la cache de atencion (claves y valores) de un modelo a otro durante una conversacion, de forma que el modelo receptor no tenga que reprocesar todo el contexto. El paquete cubre 15 modelos abiertos, 7 familias de cache y 12 tokenizadores, mediante un conjunto de adaptadores lineales de forma cerrada (dos por modelo, sin mapas por pares ni entrenamiento por gradiente).

El problema que resuelve es concreto: cuando un agente local cambia de modelo a mitad de una conversacion larga, el nuevo modelo debe hacer prefill de todo el contexto, lo que en una GPU de consumo supone decenas de segundos. Este bundle traduce la cache del modelo antiguo a la del nuevo a traves de un espacio latente compartido, y el modelo receptor solo reprocesa los ultimos aproximadamente 2.048 tokens. Segun la model card, el tiempo de reanudacion tras un cambio baja a 5-18 s (mediana 7-9 s) en sesiones de agente de 5-14K tokens, frente a 10-37 s de prefill nativo.

El paquete esta pensado para usarse con la herramienta `kvpark bridge` del repositorio uncrayon/kvpark (MIT), sobre llama.cpp. El repositorio ocupa 17,7 GB, no tiene descargas ni likes, y la model card reporta mediciones realizadas en un AMD Ryzen AI Max+ 395 con iGPU Radeon 8060S.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores lineales de forma cerrada sobre caches KV de transformers (dense, sliding-window, MLA y Mamba hybrid); no es un modelo de lenguaje |
| Parametros totales | no disponible |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (el paquete opera sobre caches de hasta 14K tokens en las mediciones reportadas) |
| Tipos de cuantizacion | no disponible (los ejemplos usan GGUF Q8_0 y Q4_K_XL de los modelos subyacentes) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el bundle se carga con `engine.py` sobre llama.cpp/ggml) |

## Arquitectura y entrenamiento

El paquete no contiene un transformer entrenado, sino un conjunto de adaptadores lineales que proyectan las claves y valores de la cache de atencion de un modelo origen a un espacio latente compartido, y de ahi a la cache del modelo destino. Segun la model card, se usan dos adaptadores por modelo y no hay mapas por pares ni entrenamiento por gradiente: los adaptadores se obtienen en forma cerrada. El bundle cubre 15 modelos, 7 familias de cache y 12 tokenizadores.

El ajuste de los adaptadores se realiza sobre datos de conversacion. La model card indica que un hub ajustado sobre chat rinde peor en sesiones de agente, y que anadir 11 sesiones de agente al ajuste eleva la calidad en esas sesiones del 19% al 27% (mejor en 13 de 18 sesiones, p = .013), a costa de bajar del 35% al 28% en chat. La traduccion solo modifica los valores cacheados de tokens antiguos; los token ids se mantienen exactos y el servidor llama.cpp reutiliza unicamente las celdas cuyos tokens coinciden.

## Capacidades

- Transferencia de cache KV entre modelos distintos a traves de un latente compartido, sin re-prefill completo del contexto.
- Soporte de familias de cache dense, sliding-window, MLA y Mamba hybrid; las Mamba hybrid con pocas capas de atencion apenas se benefician.
- Compatibilidad con llama.cpp y llama-server, con slots por modelo.
- Reutilizacion exacta de token ids: solo los valores cacheados de tokens antiguos son aproximados.
- Reversion del estado: `kvpark bridge undo` permite deshacer una cache traducida.
- Ajustes por destino: `--native-prefix`, `--recurrent-mean` para destinos hibridos y `--no-source`.
- Ejecucion en iGPU (Vulkan o ROCm) y en CPU, con tiempos de traduccion distintos.

## Casos de uso

- Hand-off de agentes de codigo entre modelos: en una sesion de 9.105 tokens, el ejemplo de la model card traduce 7.057 tokens de cache de Qwen3.8 a Gemma-4-31B en 2,23 s totales (0,22 s de guardado del origen, 1,48 s de motor, 0,35 s de restauracion) y el destino solo reprocesa 2.048 tokens.
- Enrutado por coste o capacidad en produccion: enviar conversaciones largas a un modelo mas pequeno o barato cuando la tarea lo permite, sin pagar el prefill completo del contexto.
- Conmutacion por fallo entre servidores locales: si un llama-server deja de responder, otro modelo puede retomar la conversacion con una cache traducida en lugar de reprocesar todo el historial.
- Sesiones de agente con herramientas: la model card reporta que, tras un cambio desde Qwen3.8, Gemma-4-31B eligio la misma herramienta que con prefill nativo en 15 de 18 sesiones, el mismo fichero o comando en 8 y una llamada identica en 5.
- Experimentacion con caches KV: el paquete sirve como banco de pruebas para estudiar la transferencia de estado entre arquitecturas (dense, MLA, hibridas) sin reentrenar modelos.
- Despliegue en hardware de consumo: las mediciones se hicieron en una iGPU Radeon 8060S, con traduccion de 0,4-1,8 s en Vulkan o ROCm y 2-14 s en CPU, lo que permite usar el flujo en equipos sin GPU dedicada.

## Benchmarks y rendimiento

Los datos de la model card son mediciones de tiempo y de divergencia, no benchmarks de calidad de modelo. Se recogen a continuacion.

| Metrica | Resultado reportado |
|---|---|
| Tiempo de reanudacion tras cambio (sesiones de agente de 5-14K tokens) | 5-18 s, mediana 7-9 s; prefill nativo 10-37 s |
| Aceleracion mediana en sesiones de agente de codigo | 2,2-2,9x (rango 1,4-3,9x, pausas termicas excluidas) |
| Chats de 12-15K tokens hacia Qwen3.8 | 9,7-12,5 s de cambio frente a 48-52 s de prefill nativo; cota conservadora 1,9-3,9x |
| Coste de la traduccion | 0,4-1,8 s en iGPU (Vulkan o ROCm); 2-14 s en CPU |
| Calidad en chat (reduccion de la perdida del baseline sin informacion) | 16-83% para 9 de 11 destinos |
| Calidad en sesiones de agente (Qwen3.8 ↔ Gemma-4-31B) | 16-38% |
| Misma herramienta que con prefill nativo | 12-15 de 18 sesiones; sin ganancia medible frente al baseline |

## Requisitos de hardware

- VRAM estimada: no disponible. El bundle ocupa 17,7 GB en el repositorio, pero es un conjunto de adaptadores, no un modelo; los requisitos reales dependen de los modelos servidos por llama-server.
- GPU recomendadas: no hay lista oficial. Las mediciones se realizaron en una iGPU Radeon 8060S (AMD Ryzen AI Max+ 395) con backend Vulkan.
- Cabe en GPU de consumo: si, segun la model card, el flujo se ejecuto en una iGPU integrada; no se reportan pruebas en RTX 4090, A100 o H100.
- Opciones de despliegue: llama.cpp y llama-server con slots por modelo, mas `kvpark bridge` (comandos `add`, `engine`, `switch`, `undo`) y el script `experiments/universal_kv/engine.py`.
- Latencia y throughput: traduccion de 0,4-1,8 s en iGPU y 2-14 s en CPU; el tiempo total de cambio es aproximadamente constante (traduccion mas cola nativa fija de 2.048 tokens), mientras que el prefill nativo crece con la longitud de la sesion.

## Comparativa con modelos similares

| Alternativa | Tipo | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kvpark-hub6 | Paquete de adaptadores de cache KV | Opera sobre caches de hasta 14K tokens en las pruebas | Cambio en 5-18 s frente a 10-37 s de prefill nativo | MIT | Hugging Face, 0 descargas |
| Prefill nativo en llama.cpp | Metodo sin traduccion | Limitado por la ventana del modelo | Coste proporcional a la longitud del contexto | MIT | Estandar |
| Baseline de cache sin informacion (citado en la model card) | Referencia experimental | Igual que el hub | Peor divergencia que la traduccion; misma herramienta que nativo en 14 de 18 sesiones | no disponible | Solo como referencia interna |

No se dispone de otros paquetes publicos comparables de transferencia de cache KV entre modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto por si mismo; requiere llama.cpp, llama-server y los modelos subyacentes.
- La cache traducida es aproximada: solo los valores cacheados de tokens antiguos son inexactos, lo que puede alterar lo que el modelo escribe.
- Las Mamba hybrid con pocas capas de atencion apenas se benefician; para ellas la model card recomienda prefill nativo.
- El ajuste sobre chat penaliza las sesiones de agente (35% a 28%) y viceversa; no hay un hub unico optimo para ambos.
- Aproximadamente la mitad de la perdida restante en sesiones de agente se concentra en tokens no cubiertos por el hub, como el marcado de plantillas.
- No hay ganancia medible en la eleccion de herramienta frente al baseline sin informacion; el beneficio demostrado es una menor divergencia respecto a un re-prefill completo.
- Las mediciones se hicieron en un unico equipo (Ryzen AI Max+ 395 con iGPU) y las pausas termicas introducen incertidumbre; la cota conservadora de aceleracion es 1,9-3,9x.
- El repositorio no tiene descargas ni likes, y la model card no documenta sesgos, idiomas ni evaluaciones de seguridad.
- La licencia MIT permite uso comercial, pero no se detallan restricciones adicionales sobre los modelos subyacentes.

## Enlaces

- Hugging Face: https://huggingface.co/uncrayon/kvpark-hub6
- Repositorio kvpark: https://github.com/uncrayon/kvpark
- Documentacion del bridge: `docs/bridge.md` en el repositorio
- Metodo y mediciones completas: `experiments/universal_kv/` en el repositorio
