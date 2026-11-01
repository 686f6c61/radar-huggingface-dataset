# Thox-ai/ThoxIOS-System

## Resumen

ThoxIOS-System es un paquete de configuracion publicado por Thox-ai que combina los pesos sin modificar de Qwen3-1.7B con un perfil de sistema propio de THOX (denominado THOX iOS System Profile) y una base de conocimiento versionada (THOX Knowledge Pack v0.1, con 8 entradas publicas verificadas en formato JSONL). El repositorio de HuggingFace no contiene pesos entrenados por THOX: contiene el `Modelfile` de Ollama, un `manifest.json` y el fichero JSONL de conocimiento. El modelo ejecutable se distribuye a traves de Ollama (`ollama run Thox-ai/thox-ios-system`), que descarga los pesos originales de Qwen3-1.7B desde el pin de su digest.

El origen del proyecto es relevante para entender que se esta evaluando: el kit THOX iOS Model Kit define este perfil como sustituto local de Apple Foundation Models, cuyos pesos estan gestionados por el sistema en el dispositivo y no se distribuyen en ningun formato descargable. Segun la model card, una decision interna registrada el 2026-10-31 autoriza publicar el perfil de sistema sobre Qwen3-1.7B como stand-in explicitamente etiquetado, con la misma disciplina de grounding y postura de enrutado, pero sin ninguna relacion con Apple ni cualificacion para dispositivo.

Por tanto, no es un modelo nuevo ni un fine-tune: es un artefacto de configuracion y empaquetado orientado a experimentacion local con el perfil THOX, desarrollo de integraciones iOS contra el comportamiento del perfil y como referencia antes de la integracion real con Foundation Models en dispositivo. La relevancia practica esta en el enfoque de "configuration-derived model" (modelo derivado de configuracion) y en la disciplina de grounding que impone el perfil, no en una mejora de capacidades sobre la base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B; no se detalla en la informacion disponible) |
| Parametros totales | 1,7 mil millones (1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (verificado en la evaluacion del autor con carga correcta a esa ventana) |
| Tipos de cuantizacion | no disponible de forma explicita; la build de Ollama pinneada ocupa 1,36 GB, lo que sugiere una cuantizacion de baja precision (probablemente Q4, sin confirmar) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | pesos gestionados por Ollama (pull desde el digest pinneado); el repositorio solo incluye `Modelfile`, `manifest.json` y `thox-knowledge-v0.1.jsonl` |

## Arquitectura y entrenamiento

No hay entrenamiento. La model card lo declara de forma explicita: THOX no entreno, no hizo fine-tune ni modifico los pesos base, que son byte-identicos a la release upstream de Qwen3-1.7B (digest `sha256:8f68893c685c3ddff2aa3fffce2aa60a30bb2da65ca488b61fff134a4d1730e7`, 1,36 GB). El trabajo de THOX consiste en el perfil de sistema (`profiles/THOX_SYSTEM.txt`), el Knowledge Pack v0.1, la evaluacion y el empaquetado.

La innovacion tecnica no esta en la arquitectura, sino en el mecanismo de configuracion: un perfil de sistema que impone disciplina de grounding (responder solo a partir de referencias aprobadas y no inferir estado operativo en vivo) y una postura de enrutado, junto con un pack de conocimiento versionado que se inyecta como contexto verificado. El `Modelfile` fija la base y aplica el perfil; el `manifest.json` registra el pin de la base, el perfil y la version del knowledge pack, lo que permite reproducibilidad del build. No se documentan detalles sobre datos de entrenamiento de la base (numero de tokens, composicion, RLHF/DPO), por lo que esos datos deben consultarse en la model card de Qwen3-1.7B.

## Capacidades

- Generacion de texto en ingles sobre la base Qwen3-1.7B.
- Grounding sobre conocimiento verificado: responde a partir de pasajes suministrados del Knowledge Pack v0.1 (8 entradas publicas).
- Rechazo explicito de trampas de topologia fabricada: el perfil instruye no confirmar estado operativo en vivo que no este establecido por las referencias aprobadas.
- Postura de enrutado: el perfil define comportamiento para peticiones de routing frente a tensor parallelism (tema presente en la evaluacion del autor).
- Razonamiento basico y profundidad limitada, coherente con un modelo de 1,7B.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Vision, audio, thinking mode: no disponible en la informacion proporcionada.

## Casos de uso

- Experimentacion local con el perfil THOX iOS: ejecutar `ollama run Thox-ai/thox-ios-system` en cualquier maquina con Ollama (la build de 1,7B carga en unos 2 GB) para observar como se comporta el perfil de sistema antes de integrarlo en dispositivo.
- Desarrollo de integraciones iOS contra el comportamiento del perfil: usar la build local como referencia de respuestas, formato y disciplina de grounding mientras se prepara la integracion con Foundation Models en el dispositivo.
- Validacion de disciplina de grounding: alimentar el modelo con pasajes verificados y comprobar que responde solo con los hechos suministrados, incluida la respuesta de rechazo ante preguntas sobre estado operativo no establecido.
- Pruebas de trampas de topologia: reproducir el caso de "verificar si MeshStack corre en tres nodos" para comprobar que el perfil no fabrica estado en vivo; util en suites de evaluacion de robustez.
- Empaquetado reproducible de perfiles: usar `manifest.json` y `Modelfile` como plantilla para versionar perfiles de sistema y knowledge packs en otros proyectos con Ollama.
- Referencia de bajo coste en CI: ejecutar smoke tests de comportamiento del perfil en CPU (el autor midio 24,37 tokens/s en x86_64 sin GPU) para validar cambios de perfil antes de desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La evaluacion del autor es una smoke test de comportamiento, no un benchmark de capacidades:

| Metrica | Resultado |
|---|---|
| Base pinneada | qwen3:1.7b, digest `sha256:8f68893c...1730e7`, 1,36 GB |
| Carga | correcta a 8.192 tokens de contexto |
| Memoria en carga | 2,43 GB de RAM de sistema, 0 GB de VRAM (ejecucion solo CPU, x86_64) |
| Throughput (generacion long-form, 2.124 tokens) | 24,37 tokens/s |
| Preguntas smoke de fabrica | 3/3 respondidas (principio de marca, trampa de topologia MeshStack, routing frente a tensor parallelism) |
| Grounding del Knowledge Pack | 6 de 8 temas respondidos con los hechos requeridos (conteo estricto por keyword); de los 2 fallos, uno fue parafrasis sustantivamente correcta y otro timeout por contencion del host, re-ejecutado standalone y respondido correctamente |

El autor advierte que el throughput debe tratarse como suelo en condiciones de host compartido, no como perfil de estacion de trabajo.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB en la configuracion medida (ejecucion solo CPU); la build pinneada ocupa 1,36 GB en disco y 2,43 GB de RAM de sistema en carga.
- GPU recomendadas: no disponibles en la informacion proporcionada; la evaluacion publicada es solo CPU x86_64.
- Compatibilidad con consumer GPU: no confirmada en la informacion disponible; por tamano (1,7B) cabe previsiblemente en GPUs de consumo, pero no hay dato verificado.
- Opciones de despliegue: Ollama (`ollama run Thox-ai/thox-ios-system` o build local con `ollama create thox-ios-system -f Modelfile`); vLLM, llama.cpp, TGI u otras no se mencionan.
- Latencia y throughput: 24,37 tokens/s en generacion long-form sobre CPU x86_64, como suelo bajo contencion de host.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento propio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThoxIOS-System | 1,7B | 8.192 tokens | No (configuracion sobre Qwen3-1.7B) | Apache-2.0 | Ollama + repo de empaquetado en HuggingFace |
| Qwen3-1.7B (base) | 1,7B | no disponible en esta ficha | Si (upstream Qwen) | Apache-2.0 | Pesos descargables |
| Apple Foundation Models | no disponible | no disponible | Si (Apple) | no disponible | Gestionado por el sistema en dispositivo, sin pesos descargables |

La comparacion con otras alternativas de la misma categoria (perfiles de configuracion sobre modelos pequenos) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Los pesos son un stand-in (Qwen3-1.7B) y no reproducen el comportamiento, calidad ni capacidades de Apple Foundation Models; solo se comparte el perfil de sistema.
- No evaluado en hardware Apple ni cualificado para dispositivo.
- Modelo pequeno: profundidad de razonamiento limitada.
- Solo ingles declarado; sin soporte multilingue verificado.
- Riesgo de alucinacion inherente a la base; el perfil mitiga inferencias de estado operativo en vivo, pero no elimina el riesgo general.
- El conteo de grounding fue de 6/8 en la smoke test estricta por keyword; uno de los fallos fue timeout por contencion del host.
- El repositorio no contiene pesos: cualquier uso requiere descargar la base desde el pin de Ollama; no hay artefactos GGUF ni safetensors en el repo.
- Licencia Apache-2.0 para la configuracion y el empaquetado, coherente con la base; no se declaran restricciones adicionales de uso comercial en la informacion disponible.
- El perfil instruye al modelo a no implicar que THOX posee pesos de Apple Foundation Models; la model card lo declara igualmente.

## Enlaces

- HuggingFace: https://huggingface.co/Thox-ai/ThoxIOS-System
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Ollama: `ollama run Thox-ai/thox-ios-system`
- Papers, blogs, repos o demos adicionales: no disponible en la informacion proporcionada.
