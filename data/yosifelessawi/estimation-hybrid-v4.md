# yosifelessawi/estimation-hybrid-v4

## Resumen

Hybrid v4 es un agente de reinforcement learning desarrollado por Yosif Elessawi para el juego de cartas Estimation, un juego de bazas con apuestas y estimación de bazas ganadas. El modelo se distribuye como un checkpoint de PyTorch (`hybrid.pt`) que contiene únicamente pesos y parámetros numéricos: una red de apuesta (bid net), una red de cartas (card net) y una red de conjetura (guess net) que estima la ubicación de las cartas ocultas del resto de jugadores.

El entrenamiento se realizó exclusivamente mediante self-play (auto-juego) seguido de una fase de destilación desde una búsqueda más profunda, sin utilizar partidas humanas. En tiempo de juego, el agente emplea una estrategia híbrida que combina inferencia neuronal con búsqueda: para cada carta conserva las dos mejores opciones de la card net, simula 32 repartos de las manos ocultas compatibles con las apuestas realizadas hasta el momento y juega cada reparto hasta el final usando la card net en los cuatro asientos, seleccionando la opción con mejor puntuación media.

El modelo es relevante como ejemplo de agente especializado en un dominio de información imperfecta con un diseño de búsqueda determinista sobre un modelo de creencias (el guess net). Su utilidad práctica está limitada por el hecho de que su ejecución depende de un motor de reglas privado, aunque el agente se publica bajo licencia MIT. El repositorio en Hugging Face tiene un tamaño de 0.0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Redes neuronales específicas del dominio (bid net, card net, guess net) sobre PyTorch; no se especifica la topología interna |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (agente de juego, sin procesamiento de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | checkpoint de PyTorch (`hybrid.pt`) |

## Arquitectura y entrenamiento

El sistema se compone de tres redes neuronales con funciones diferenciadas: una red de apuesta que selecciona la apuesta inicial, una red de cartas que evalúa las opciones de juego carta a carta y una red de conjetura que estima la distribución de las cartas ocultas en manos ajenas. No se detalla en la información disponible la topología concreta de cada red (número de capas, dimensiones, tipo de bloques), por lo que no es posible especificar la arquitectura interna más allá de que son modelos de PyTorch.

El entrenamiento se realizó en dos fases: primero mediante self-play, sin partidas humanas, y después mediante destilación desde una búsqueda más profunda, de modo que las redes aprenden a imitar las decisiones de un buscador con mayor capacidad de cómputo. La innovación técnica destacable es el mecanismo de decisión en tiempo de juego: el agente no se limita a la salida directa de la red, sino que mantiene las dos mejores opciones de la card net, genera 32 repartos hipotéticos de las manos ocultas muestreados desde el guess net condicionados por las apuestas observadas, simula cada reparto completo con la card net en los cuatro asientos y elige la jugada con mejor puntuación media. No se dispone de información sobre el número de tokens, la composición del dataset ni el uso de RLHF o DPO, que no aplican a este dominio.

## Capacidades

- Juego de Estimation: selección de apuesta inicial mediante la bid net.
- Juego de cartas carta a carta mediante la card net, con evaluación de las dos mejores opciones en cada decisión.
- Inferencia de cartas ocultas: la guess net estima la ubicación de las cartas no visibles en las manos de los demás jugadores.
- Búsqueda con simulación: genera 32 repartos compatibles con las apuestas observadas y evalúa cada jugada por puntuación media sobre esos repartos.
- Juego completo en los cuatro asientos: la card net se usa para simular también las respuestas de los oponentes durante la búsqueda.
- Entrenamiento sin datos humanos: aprendizaje exclusivo por self-play y destilación desde búsqueda.
- No dispone de soporte de tool calling, function calling, razonamiento multi-paso genérico, capacidades multilingües ni modos de pensamiento extendido; es un agente monoespecífico de juego de cartas.

## Casos de uso

- Investigación en información imperfecta: el agente sirve como banco de pruebas para estudiar cómo un modelo de creencias (guess net) condicionado por apuestas mejora la búsqueda en juegos de bazas, comparando la política neuronal pura con la búsqueda sobre 32 repartos.
- Evaluación de técnicas de destilación desde búsqueda: permite analizar la brecha entre una política entrenada por self-play y un buscador más profundo, replicando el pipeline en otros juegos de cartas con estructura similar.
- Referencia para el desarrollo de bots de Estimation: el código de integración está en el repositorio `estimation-arena` (ruta `bots/hybrid-v4`), lo que facilita comparar el rendimiento de nuevas políticas contra este agente en la leaderboard.
- Estudio de robustez ante información parcial: la simulación de 32 repartos permite medir cómo varía la calidad de decisión según el número de muestras y la precisión del guess net.
- Docencia en reinforcement learning aplicado: como ejemplo compacto de un pipeline completo (self-play, destilación, búsqueda en tiempo de inferencia) en un dominio acotado y con licencia permisiva.
- Experimentación con presupuesto de cómputo: el número de repartos simulados (32) es un parámetro ajustable que permite trazar la curva coste-rendimiento del agente en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el agente está clasificado en la leaderboard de Estimation Arena, pero no se proporcionan puntuaciones, tasas de victoria ni comparaciones numéricas con otros agentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del checkpoint no se especifica (el repositorio figura con 0.0 GB, lo que sugiere pesos de pequeño tamaño, pero no permite una estimación fiable).
- GPU recomendadas: no disponible; al ser un agente de juego con redes pequeñas, es probable que funcione en CPU, pero no hay datos que lo confirmen.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ejecución mediante PyTorch cargando el checkpoint `hybrid.pt`; requiere el motor de reglas del proyecto `estimation-arena`, que actualmente es privado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible. La búsqueda en tiempo de juego implica simular 32 repartos completos con la card net en los cuatro asientos por cada decisión de carta, lo que determina el coste computacional, pero no se publican mediciones.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otros agentes publicados para Estimation con los que comparar parámetros, contexto, rendimiento o licencia. La única referencia de comparación es la leaderboard de Estimation Arena, que no incluye datos numéricos en la documentación consultada.

## Limitaciones y advertencias

- Dependencia de un motor de reglas privado: la ejecución del agente requiere el rules engine del proyecto `estimation-arena`, que no es público, lo que impide reproducir su comportamiento de forma autónoma con los materiales publicados.
- Ámbito estrictamente limitado: es un agente específico para Estimation; no procesa lenguaje natural, no tiene capacidades generales de razonamiento ni de generación de texto.
- Sin datos de evaluación publicados: no hay puntuaciones verificables en la información disponible, por lo que no es posible validar su nivel de juego frente a alternativas.
- Riesgo de sobreajuste al dominio: al entrenarse exclusivamente por self-play y destilación desde búsqueda, su comportamiento está acoplado a las reglas y convenciones concretas del juego implementadas en el motor.
- Sesgos: no se documentan sesgos conocidos, pero al no usar datos humanos el agente puede explotar particularidades del motor de simulación en lugar de estrategias robustas frente a oponentes humanos.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene revisar los términos del motor de reglas privado, que puede tener condiciones distintas.
- Repositorio sin actividad: cero descargas y cero likes en el momento de la consulta, sin historial de mantenimiento que garantice soporte o actualizaciones.
- Idiomas: no disponible; no aplica al no ser un modelo de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yosifelessawi/estimation-hybrid-v4
- Leaderboard de Estimation Arena: https://essamgouda97.github.io/estimation-arena/
- Repositorio del proyecto (código e instrucciones, ruta `bots/hybrid-v4`): https://github.com/essamgouda97/estimation-arena
- Perfil de GitHub del autor: https://github.com/YosifElessawi
