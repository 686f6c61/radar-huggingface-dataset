# vruga/g1-plate-bc-human

## Resumen

`g1-plate-bc-human` es una política de imitación (behaviour cloning) desarrollada por el usuario vruga para el robot humanoide Unitree G1, entrenada específicamente para la tarea `move_plate` del simulador BiGym2. El modelo resuelve el problema de transferir un plato entre posiciones mediante control robótico, y su interés radica en que sirve como línea base pura de imitación: se entrenó únicamente con las 60 demostraciones humanas disponibles en BiGym2, sin datos generados por simulador ni episodios de un experto privilegiado.

La relevancia de esta ficha es metodológica: el autor publica el mismo modelo con y sin datos privilegiados, lo que permite cuantificar el impacto de aumentar el conjunto de entrenamiento. Con solo demostraciones humanas alcanza un 78,3% de éxito en la configuración más exigente, mientras que añadir 298 episodios de un experto privilegiado eleva esa misma métrica al 98%. Es, por tanto, una referencia útil para investigar cuánto margen de mejora aporta cada fuente de datos en imitación robótica.

El repositorio es pequeño (0,1 GB), está implementado en PyTorch, se distribuye bajo licencia Apache 2.0 y no incluye información sobre arquitectura interna, número de parámetros ni longitud de contexto, ya que no es un modelo de lenguaje sino una política de control.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de behaviour cloning en PyTorch; misma arquitectura que `vruga/g1-plate-bc-expert`, sin detallar) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio PyTorch, 0,1 GB) |

## Arquitectura y entrenamiento

El autor indica que la arquitectura es la misma que la del modelo `vruga/g1-plate-bc-expert`, pero no se especifica en la información disponible qué tipo de red utiliza (transformer, MLP, política difusa, etc.) ni su tamaño. El entrenamiento consistió en 30.000 pasos de behaviour cloning supervisado sobre las 60 demostraciones humanas de la tarea `move_plate` de BiGym2, sin añadir datos generados por el simulador ni episodios de un experto privilegiado. Esta restricción es deliberada: el modelo funciona como línea base para medir la contribución de los datos humanos puros frente a los datos sintéticos o privilegiados.

No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, RLHF/DPO u otras), ni el número de tokens o composición del dataset más allá de las 60 demostraciones citadas. La evaluación se realizó con el protocolo "balanced-slot" de BiGym2, que distribuye los ensayos entre seis posiciones de destino del plato, y los informes crudos están en la carpeta `reports/` del repositorio, con el registro completo en `EXPERIMENTS.md`.

## Capacidades

- Control robótico para la tarea de transferencia de platos (`move_plate`) en el simulador BiGym2 con el humanoide Unitree G1.
- Ejecución de políticas de imitación entrenadas exclusivamente con demostraciones humanas.
- Evaluación reproducible mediante el protocolo balanced-slot con seeds públicos.
- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No está diseñado para agentes conversacionales ni razonamiento multi-paso.
- Sin capacidades multilingües.
- Sin modo de pensamiento (thinking mode), audio u otras modalidades.

## Casos de uso

- Línea base de imitación pura: sirve para comparar el rendimiento de políticas entrenadas solo con datos humanos frente a variantes que incorporan datos sintéticos o privilegiados, usando el mismo protocolo de evaluación y las mismas seeds.
- Estudio de la brecha humano-simulador: al medir el éxito con 60 demostraciones humanas (78,3% en la configuración más exigente) y compararlo con la variante que añade 298 episodios privilegiados (98%), permite cuantificar cuánto aporta cada fuente de datos.
- Reproducción de experimentos de BiGym2: el repositorio incluye informes en `reports/` y un registro en `EXPERIMENTS.md`, lo que facilita replicar las evaluaciones con las seeds 7.310.000+ y 7.320.000+.
- Investigación en robótica de manipulación: la tarea de transferencia de platos con seis posiciones de destino es un banco de pruebas acotado para estudiar la generalización de políticas de imitación.
- Desarrollo de pipelines de evaluación: el protocolo balanced-slot y las métricas por slot (1 a 6) permiten construir comparativas sistemáticas entre políticas sobre el mismo entorno.
- Formación y docencia: como ejemplo compacto (0,1 GB) de flujo de trabajo completo en imitación robótica, desde el entrenamiento con demostraciones hasta la evaluación con seeds públicas.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) para la tarea G1 plate transfer (BiGym2 `move_plate`, protocolo balanced-slot):

| Configuración | Seeds | Ensayos | Éxito | Por slot 1..6 |
|---|---|---|---|---|
| execute 10, público | 7.310.000+ | 30 | 15 (50,0%) | 1, 3, 3, 4, 2, 2 |
| execute 10 | 7.320.000+ | 60 | 39 (65,0%) | 7, 5, 7, 8, 7, 5 |
| execute 20 | 7.320.000+ | 60 | 47 (78,3%) | 5, 9, 8, 9, 10, 6 |

Como referencia, el autor indica que añadir 298 episodios de un experto privilegiado eleva el éxito de la misma configuración (seeds 7.320.000+, execute 20) del 78% al 98%.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,1 GB, por lo que el modelo es muy ligero y probablemente quepa en GPUs de consumo, aunque no se confirma en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; por el tamaño del repositorio (0,1 GB) es plausible, pero no se documenta.
- Opciones de despliegue: no disponible; el modelo está en formato PyTorch y se integra en el ecosistema BiGym2, pero no se detallan servidores de inferencia (vLLM, llama.cpp, Ollama, TGI) porque no aplican a una política robótica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Éxito (BiGym2 move_plate) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `vruga/g1-plate-bc-human` (este) | no disponible | no aplica | 78,3% (execute 20, seeds 7.320.000+) | Apache 2.0 | Hugging Face |
| `vruga/g1-plate-bc-expert` | no disponible (misma arquitectura) | no aplica | no disponible en la información proporcionada | no disponible | Hugging Face |
| Variante con 298 episodios privilegiados (citada por el autor) | no disponible | no aplica | 98% (misma configuración) | no disponible | no disponible |

No se dispone de datos de otros modelos comparables de terceros en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea `move_plate` de BiGym2 con el robot Unitree G1; no generaliza a otras tareas ni a otros robots sin reentrenamiento.
- El conjunto de entrenamiento es muy reducido (60 demostraciones humanas), lo que limita la robustez y explica el 78,3% de éxito frente al 98% de la variante con datos privilegiados.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas, ya que no es un modelo de lenguaje.
- La licencia Apache 2.0 permite uso comercial, pero no se detallan restricciones adicionales del entorno BiGym2 ni de los datos de demostración utilizados.
- No se especifican la arquitectura, el número de parámetros ni los requisitos de hardware, lo que dificulta la reproducibilidad completa sin consultar el repositorio y el archivo `EXPERIMENTS.md`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vruga/g1-plate-bc-human
- Modelo de referencia con la misma arquitectura: https://huggingface.co/vruga/g1-plate-bc-expert
- No se han proporcionado enlaces adicionales (papers, blogs, repositorios o demos) en la información disponible.
