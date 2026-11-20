# tsilva/SuperMarioBros-Nes-v0_Level1-1

## Resumen

SuperMarioBros-Nes-v0_Level1-1 es un checkpoint de política de aprendizaje por refuerzo (RL) entrenado con PPO sobre el entorno Super Mario Bros. de NES, concretamente en el nivel 1-1. Lo publica el usuario tsilva en Hugging Face bajo la librería `gradlab`, una herramienta de entrenamiento y evaluación de agentes RL que el propio autor mantiene. No es un modelo de lenguaje: es una política que mapea observaciones del juego a acciones, empaquetada junto con los ficheros `model.zip`, `model.json` y `recipe.json` que describen el entrenamiento.

El checkpoint retenido corresponde a 2.629.632 transiciones de entrenamiento y, según la model card, completó 95 de 100 episodios en la ventana de entrenamiento registrada. El autor advierte explícitamente de que no se ejecutó una evaluación de aceptación independiente, por lo que la cifra de 95/100 procede del propio entrenamiento y no de un test separado. El repositorio tiene un tamaño de 0,0 GB y cero descargas y likes en el momento de la consulta.

Su relevancia es acotada: sirve como referencia reproducible de un agente PPO para un entorno clásico de RL y como ejemplo del formato de bundles que produce GradLab. No aporta capacidades de generación de texto, visión general ni tool calling, y su uso requiere disponer de la ROM de Super Mario Bros. de NES por medios propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | política de RL entrenada con PPO (red neuronal; topología no especificada en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; observaciones del entorno Super Mario Bros. NES) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; agente sobre un videojuego) |
| Licencia | no disponible |
| Formato de pesos | bundle GradLab: `model.zip`, `model.json`, `recipe.json` |

## Arquitectura y entrenamiento

La política se entrenó con PPO (Proximal Policy Optimization) desde pesos iniciales aleatorios ("fresh weights") sobre el nivel 1-1 del entorno `SuperMarioBros-Nes-v0`, con semilla 12. El entrenamiento se realizó con GradLab, la herramienta del autor, y el checkpoint retenido se seleccionó a las 2.629.632 transiciones. La model card no detalla la topología de la red (número de capas, unidades, si usa CNN para procesar píxeles), la función de recompensa, los hiperparámetros de PPO ni la composición exacta del entorno de entrenamiento.

El bundle incluye el `recipe.json`, que presumiblemente recoge la configuración del experimento, y el identificador de ejecución `gradlab-34847b00808fecbe3f765c80d381a31a`. La verificación de la campaña está enlazada a un informe del repositorio de GradLab en GitHub, en la sección "Level1-1" con fecha 2026-11-13. No se documentan técnicas adicionales como decodificación especulativa, atención lineal ni fases de RLHF/DPO, que no aplican a este tipo de modelo.

## Capacidades

- Control de un agente sobre el nivel 1-1 de Super Mario Bros. de NES a partir de observaciones del entorno.
- Política entrenada con PPO para maximizar recompensa en el entorno `SuperMarioBros-Nes-v0`.
- Reproducibilidad mediante GradLab: el bundle permite cargar y ejecutar la política con el comando `gradlab play hf://tsilva/SuperMarioBros-Nes-v0_Level1-1 --rom-path /path/to/SuperMarioBros.nes`.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso fuera del bucle de interacción propio del entorno RL.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades especiales.

## Casos de uso

- Reproducción de experimentos de RL: cargar el checkpoint con GradLab y ejecutarlo sobre la ROM para verificar el comportamiento descrito en la model card (95/100 episodios en la ventana de entrenamiento) y comparar con nuevas ejecuciones.
- Docencia y formación en RL: usar el bundle como ejemplo práctico de un agente PPO entrenado sobre un entorno clásico, inspeccionando `recipe.json` para entender la configuración del experimento.
- Punto de partida para fine-tuning: reanudar el entrenamiento desde este checkpoint con GradLab para probar variantes de hiperparámetros, recompensas o semillas en el mismo nivel.
- Benchmark interno de herramientas RL: comparar el rendimiento de GradLab frente a otras librerías (Stable-Baselines3, CleanRL) usando este checkpoint como referencia de política entrenada.
- Análisis de políticas: estudiar las trayectorias y decisiones del agente en el nivel 1-1 para investigar comportamientos emergentes o fallos sistemáticos.
- Integración en demos y visualizaciones: ejecutar el agente en un entorno controlado para generar grabaciones o material divulgativo sobre RL aplicado a videojuegos.

## Benchmarks y rendimiento

La única métrica publicada en la model card es que el checkpoint retenido, a 2.629.632 transiciones, completó 95 de 100 episodios en su ventana de entrenamiento registrada. El autor indica que no se ejecutó una evaluación de aceptación separada para este checkpoint, por lo que no hay resultados de test independientes.

| Metrica | Valor | Notas |
|---|---|---|
| Episodios completados | 95/100 | Ventana de entrenamiento registrada; sin evaluación de aceptación separada |
| Transiciones en el checkpoint | 2.629.632 | Checkpoint retenido |
| Semilla | 12 | Entrenamiento desde pesos aleatorios |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política RL sobre NES, el coste es muy bajo y probablemente cabe en CPU, pero la model card no publica requisitos.
- GPU recomendadas: no disponible; no se especifican.
- Compatibilidad con GPU de consumo: no disponible; no se especifica, aunque por la naturaleza del entorno (NES) es plausible que funcione en hardware modesto.
- Opciones de despliegue: únicamente GradLab (`gradlab play`), según la model card. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Existen políticas RL públicas para Super Mario Bros. en la literatura y en repositorios comunitarios, pero no se han facilitado datos de parámetros, contexto, rendimiento ni licencia que permitan una comparación rigurosa. Por tanto, la comparativa se indica como no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SuperMarioBros-Nes-v0_Level1-1 | no disponible | no aplica | 95/100 episodios (ventana de entrenamiento) | no disponible | Hugging Face (GradLab) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La cifra de 95/100 episodios procede de la ventana de entrenamiento y no de una evaluación de aceptación independiente; el autor lo advierte explícitamente, por lo que no debe interpretarse como rendimiento en test.
- El agente está entrenado únicamente en el nivel 1-1; no hay evidencia de generalización a otros niveles.
- Requiere disponer de la ROM de Super Mario Bros. de NES por medios propios; el repositorio no la incluye y su uso puede estar sujeto a restricciones legales según la jurisdicción.
- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribución del checkpoint.
- No se documentan sesgos, riesgo de alucinación ni limitaciones idiomáticas porque no es un modelo de lenguaje; esos criterios no aplican.
- La topología de la red, los hiperparámetros y la función de recompensa no están documentados en la model card, lo que dificulta la reproducibilidad completa sin inspeccionar `recipe.json`.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.
- La fecha de creación indicada (2026-11-20) es posterior a la fecha actual de referencia habitual; conviene verificar la vigencia del recurso antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsilva/SuperMarioBros-Nes-v0_Level1-1
- Verificación de la campaña (informe en GitHub): https://github.com/tsilva/gradlab/blob/184138eb/experiments/reports/smb-per-level-recipe-qualification.md#level1-1--2026-11-13
- Repositorio GradLab: https://github.com/tsilva/gradlab
